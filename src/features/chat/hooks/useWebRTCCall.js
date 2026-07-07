import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const CALL_TIMEOUT_MS = 45000;

const IDLE_STATE = {
  status: "idle",
  callId: null,
  peerUsername: "",
  callType: "audio",
  direction: null,
  message: "",
  isGroupCall: false,
  roomName: "",
};

const normalizeCallType = (callType) => (callType === "video" ? "video" : "audio");

const getCandidatePayload = (candidate) => {
  if (!candidate) return null;
  if (typeof candidate.toJSON === "function") return candidate.toJSON();
  return candidate;
};

const getPeerFromSignal = (data, currentUser) => {
  const from = data?.from || data?.fromUsername || data?.sender;
  if (from && from !== currentUser) return from;

  const to = data?.to || data?.toUsername || data?.receiver;
  if (to && to !== currentUser) return to;

  return from || to || "";
};

const hasTrack = (stream, track) => {
  if (!stream || !track) return false;
  return stream.getTracks().some((item) => item.id === track.id);
};

export const useWebRTCCall = ({ socketActions, currentUser }) => {
  const [callState, setCallState] = useState(IDLE_STATE);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [localStreamVersion, setLocalStreamVersion] = useState(0);
  const [remoteStreamVersion, setRemoteStreamVersion] = useState(0);
  const [peerStreams, setPeerStreams] = useState([]);

  const stateRef = useRef(callState);
  const peerConnectionsRef = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map());
  const localTracksAddedRef = useRef(new Set());
  const remoteStreamsRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const callConnectedAtRef = useRef(null);

  useEffect(() => {
    stateRef.current = callState;
  }, [callState]);

  const syncPeerStreams = useCallback(() => {
    const streams = Array.from(remoteStreamsRef.current.entries()).map(
      ([username, stream]) => ({ username, stream }),
    );

    setPeerStreams(streams);
    remoteStreamRef.current = streams[0]?.stream || null;
    setRemoteStreamVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamVersion, callState.status]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamVersion, callState.status]);

  const clearCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      window.clearTimeout(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const getCallDurationSeconds = useCallback(() => {
    if (!callConnectedAtRef.current) return 0;
    return Math.max(0, Math.floor((Date.now() - callConnectedAtRef.current) / 1000));
  }, []);

  const buildSignalMeta = useCallback((stateOverride = {}) => {
    const state = { ...stateRef.current, ...stateOverride };
    return {
      callType: normalizeCallType(state.callType),
      isGroupCall: Boolean(state.isGroupCall),
      roomName: state.roomName || "",
      chatType: state.isGroupCall ? "room" : "people",
    };
  }, []);

  const buildCallMeta = useCallback(
    (state, overrides = {}) => {
      const isGroupCall = Boolean(state?.isGroupCall);
      const roomName = state?.roomName || "";

      return {
        callType: normalizeCallType(state?.callType),
        durationSeconds: getCallDurationSeconds(),
        caller: state?.direction === "incoming" ? state?.peerUsername : currentUser,
        receiver: isGroupCall
          ? roomName
          : state?.direction === "incoming"
            ? currentUser
            : state?.peerUsername,
        isGroupCall,
        roomName,
        chatType: isGroupCall ? "room" : "people",
        ...overrides,
      };
    },
    [currentUser, getCallDurationSeconds],
  );

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStreamVersion((value) => value + 1);
    }
  }, []);

  const closePeerConnection = useCallback(
    (peerUsername) => {
      const peerConnection = peerConnectionsRef.current.get(peerUsername);

      if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.close();
      }

      peerConnectionsRef.current.delete(peerUsername);
      pendingIceCandidatesRef.current.delete(peerUsername);
      localTracksAddedRef.current.delete(peerUsername);
      remoteStreamsRef.current.delete(peerUsername);
      syncPeerStreams();
    },
    [syncPeerStreams],
  );

  const closeAllPeerConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((peerConnection) => {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
    });

    peerConnectionsRef.current.clear();
    pendingIceCandidatesRef.current.clear();
    localTracksAddedRef.current.clear();
    remoteStreamsRef.current.clear();
    syncPeerStreams();
  }, [syncPeerStreams]);

  const resetCall = useCallback(() => {
    clearCallTimer();
    callConnectedAtRef.current = null;
    closeAllPeerConnections();
    stopLocalStream();
    setIsMicOn(true);
    setIsCameraOn(true);
    setCallState(IDLE_STATE);
  }, [clearCallTimer, closeAllPeerConnections, stopLocalStream]);

  const addLocalTracksToPeer = useCallback((peerUsername, peerConnection) => {
    if (!peerUsername || !peerConnection || !localStreamRef.current) return;
    if (localTracksAddedRef.current.has(peerUsername)) return;

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    localTracksAddedRef.current.add(peerUsername);
  }, []);

  const flushPendingIceCandidates = useCallback(async (peerUsername) => {
    const peerConnection = peerConnectionsRef.current.get(peerUsername);
    if (!peerConnection || !peerConnection.remoteDescription) return;

    const candidates = pendingIceCandidatesRef.current.get(peerUsername) || [];
    pendingIceCandidatesRef.current.set(peerUsername, []);

    for (const candidate of candidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn("Không thể thêm ICE candidate đang chờ:", error);
      }
    }
  }, []);

  const createPeerConnection = useCallback(
    (peerUsername, callId) => {
      if (!peerUsername) return null;

      const existingPeerConnection = peerConnectionsRef.current.get(peerUsername);
      if (existingPeerConnection) return existingPeerConnection;

      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate || !socketActions?.sendIceCandidate) return;

        socketActions.sendIceCandidate(
          peerUsername,
          callId,
          getCandidatePayload(event.candidate),
          buildSignalMeta(),
        );
      };

      peerConnection.ontrack = (event) => {
        let stream = remoteStreamsRef.current.get(peerUsername);

        if (event.streams && event.streams[0]) {
          stream = event.streams[0];
        } else {
          if (!stream) stream = new MediaStream();
          if (!hasTrack(stream, event.track)) stream.addTrack(event.track);
        }

        remoteStreamsRef.current.set(peerUsername, stream);
        syncPeerStreams();
        clearCallTimer();

        if (!callConnectedAtRef.current) {
          callConnectedAtRef.current = Date.now();
        }

        setCallState((previous) => ({
          ...previous,
          status: "connected",
          message: previous.isGroupCall ? "Đang trong cuộc gọi nhóm" : "Đang trong cuộc gọi",
        }));
      };

      peerConnection.onconnectionstatechange = () => {
        const status = peerConnection.connectionState;

        if (status === "connected") {
          clearCallTimer();

          if (!callConnectedAtRef.current) {
            callConnectedAtRef.current = Date.now();
          }

          setCallState((previous) => ({
            ...previous,
            status: "connected",
            message: previous.isGroupCall ? "Đang trong cuộc gọi nhóm" : "Đang trong cuộc gọi",
          }));
        }

        if (["failed", "disconnected"].includes(status)) {
          setCallState((previous) => ({
            ...previous,
            message: "Kết nối cuộc gọi đang không ổn định",
          }));
        }

        if (["failed", "closed"].includes(status)) {
          closePeerConnection(peerUsername);
        }
      };

      peerConnectionsRef.current.set(peerUsername, peerConnection);
      return peerConnection;
    },
    [buildSignalMeta, clearCallTimer, closePeerConnection, socketActions, syncPeerStreams],
  );

  const ensureLocalStream = useCallback(async (callType) => {
    const normalizedType = normalizeCallType(callType);

    if (localStreamRef.current) {
      const hasVideo = localStreamRef.current.getVideoTracks().length > 0;
      if (normalizedType === "audio" || hasVideo) return localStreamRef.current;

      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Trình duyệt không hỗ trợ microphone/camera.");
    }

    const shouldUseVideo = normalizedType === "video";

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: shouldUseVideo
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          }
        : false,
    });

    localStreamRef.current = stream;
    setIsMicOn(stream.getAudioTracks().some((track) => track.enabled));
    setIsCameraOn(stream.getVideoTracks().some((track) => track.enabled));
    setLocalStreamVersion((value) => value + 1);

    return stream;
  }, []);

  const createAndSendOffer = useCallback(
    async (peerUsername, callId, callType = "audio") => {
      if (!peerUsername || peerUsername === currentUser) return;

      await ensureLocalStream(callType);

      const peerConnection = createPeerConnection(peerUsername, callId);
      if (!peerConnection) return;

      addLocalTracksToPeer(peerUsername, peerConnection);

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: normalizeCallType(callType) === "video",
      });

      await peerConnection.setLocalDescription(offer);

      socketActions?.sendWebRTCOffer?.(
        peerUsername,
        callId,
        offer,
        normalizeCallType(callType),
        buildSignalMeta({ callType }),
      );
    },
    [
      addLocalTracksToPeer,
      buildSignalMeta,
      createPeerConnection,
      currentUser,
      ensureLocalStream,
      socketActions,
    ],
  );

  const startCall = useCallback(
    async (targetName, callType = "audio", options = {}) => {
      const normalizedType = normalizeCallType(callType);
      const isGroupCall = Boolean(options?.isGroupCall || options?.chatType === "room");
      const roomName = isGroupCall ? options?.roomName || targetName : "";

      if (!targetName || !socketActions?.callInvite) return;

      if (stateRef.current.status !== "idle") {
        window.alert("Bạn đang có một cuộc gọi khác.");
        return;
      }

      try {
        await ensureLocalStream(normalizedType);

        const callId = `${currentUser || "me"}_${targetName}_${Date.now()}`;

        setCallState({
          status: "outgoing",
          callId,
          peerUsername: targetName,
          callType: normalizedType,
          direction: "outgoing",
          message: isGroupCall ? "Đang gọi nhóm..." : "Đang gọi...",
          isGroupCall,
          roomName,
        });

        socketActions.callInvite(targetName, normalizedType, callId, {
          isGroupCall,
          roomName,
          chatType: isGroupCall ? "room" : "people",
        });

        clearCallTimer();

        callTimerRef.current = window.setTimeout(() => {
          const latestState = stateRef.current;

          if (latestState.callId !== callId || latestState.status !== "outgoing") return;

          socketActions?.callCancel?.(isGroupCall ? roomName : targetName, callId, {
            callType: normalizedType,
            durationSeconds: 0,
            caller: currentUser,
            receiver: isGroupCall ? roomName : targetName,
            reason: "Không nghe máy",
            isGroupCall,
            roomName,
            chatType: isGroupCall ? "room" : "people",
          });

          resetCall();
        }, CALL_TIMEOUT_MS);
      } catch (error) {
        console.error("Không thể bắt đầu cuộc gọi:", error);
        window.alert(error?.message || "Không thể mở microphone/camera.");
        resetCall();
      }
    },
    [clearCallTimer, currentUser, ensureLocalStream, resetCall, socketActions],
  );

  const acceptCall = useCallback(async () => {
    const currentState = stateRef.current;

    if (currentState.status !== "incoming") return;

    try {
      await ensureLocalStream(currentState.callType);

      clearCallTimer();

      setCallState((previous) => ({
        ...previous,
        status: "connecting",
        message: previous.isGroupCall ? "Đang vào cuộc gọi nhóm..." : "Đang kết nối...",
      }));

      const target = currentState.isGroupCall
        ? currentState.roomName || currentState.peerUsername
        : currentState.peerUsername;

      socketActions?.callAccept?.(
        target,
        currentState.callId,
        currentState.callType,
        buildSignalMeta(currentState),
      );
    } catch (error) {
      console.error("Không thể nhận cuộc gọi:", error);

      const target = currentState.isGroupCall
        ? currentState.roomName || currentState.peerUsername
        : currentState.peerUsername;

      socketActions?.callReject?.(
        target,
        currentState.callId,
        "Không thể mở microphone/camera",
        buildCallMeta(currentState, { durationSeconds: 0 }),
      );

      window.alert(error?.message || "Không thể mở microphone/camera.");
      resetCall();
    }
  }, [buildCallMeta, buildSignalMeta, clearCallTimer, ensureLocalStream, resetCall, socketActions]);

  const rejectCall = useCallback(
    (reason = "Từ chối cuộc gọi") => {
      const currentState = stateRef.current;

      const target = currentState.isGroupCall
        ? currentState.roomName || currentState.peerUsername
        : currentState.peerUsername;

      if (target && currentState.callId) {
        socketActions?.callReject?.(
          target,
          currentState.callId,
          reason,
          buildCallMeta(currentState, { durationSeconds: 0 }),
        );
      }

      resetCall();
    },
    [buildCallMeta, resetCall, socketActions],
  );

  const endCall = useCallback(() => {
    const currentState = stateRef.current;

    const target = currentState.isGroupCall
      ? currentState.roomName || currentState.peerUsername
      : currentState.peerUsername;

    if (target && currentState.callId) {
      if (currentState.status === "incoming") {
        socketActions?.callReject?.(
          target,
          currentState.callId,
          "Không nghe máy",
          buildCallMeta(currentState, { durationSeconds: 0 }),
        );
      } else if (currentState.status === "outgoing") {
        socketActions?.callCancel?.(
          target,
          currentState.callId,
          buildCallMeta(currentState, { durationSeconds: 0, reason: "Không nghe máy" }),
        );
      } else {
        socketActions?.callEnd?.(
          target,
          currentState.callId,
          buildCallMeta(currentState, { reason: "Cuộc gọi đã kết thúc" }),
        );
      }
    }

    resetCall();
  }, [buildCallMeta, resetCall, socketActions]);

  const toggleMic = useCallback(() => {
    const audioTracks = localStreamRef.current?.getAudioTracks?.() || [];
    if (!audioTracks.length) return;

    const nextValue = !audioTracks[0].enabled;

    audioTracks.forEach((track) => {
      track.enabled = nextValue;
    });

    setIsMicOn(nextValue);
  }, []);

  const toggleCamera = useCallback(() => {
    const videoTracks = localStreamRef.current?.getVideoTracks?.() || [];
    if (!videoTracks.length) return;

    const nextValue = !videoTracks[0].enabled;

    videoTracks.forEach((track) => {
      track.enabled = nextValue;
    });

    setIsCameraOn(nextValue);
  }, []);

  useEffect(() => {
    const handleCallSignal = async (event) => {
      const response = event.detail;
      const eventName = response?.event;
      const data = response?.data || {};
      const currentState = stateRef.current;

      if (!eventName) return;

      if (response.status === "error") {
        if (
          [
            "CALL_INVITE",
            "CALL_ACCEPT",
            "WEBRTC_OFFER",
            "WEBRTC_ANSWER",
            "WEBRTC_ICE_CANDIDATE",
          ].includes(eventName)
        ) {
          window.alert(response.message || "Cuộc gọi không thể thực hiện.");
          resetCall();
        }

        return;
      }

      try {
        switch (eventName) {
          case "CALL_INVITE": {
            if (data.from === currentUser) return;

            const incomingCallType = normalizeCallType(data.callType);
            const isGroupCall = Boolean(data.isGroupCall || data.roomName || data.chatType === "room");
            const roomName = data.roomName || (isGroupCall ? data.to : "");

            if (currentState.status !== "idle") {
              const target = isGroupCall ? roomName : data.from;

              socketActions?.callReject?.(target, data.callId, "Người dùng đang bận", {
                callType: incomingCallType,
                durationSeconds: 0,
                caller: data.from,
                receiver: isGroupCall ? roomName : currentUser,
                isGroupCall,
                roomName,
                chatType: isGroupCall ? "room" : "people",
              });

              return;
            }

            setCallState({
              status: "incoming",
              callId: data.callId,
              peerUsername: data.from,
              callType: incomingCallType,
              direction: "incoming",
              message: isGroupCall ? `Cuộc gọi nhóm ${roomName || ""}`.trim() : "Cuộc gọi đến",
              isGroupCall,
              roomName,
            });

            clearCallTimer();

            callTimerRef.current = window.setTimeout(() => {
              const latestState = stateRef.current;
              if (latestState.callId !== data.callId || latestState.status !== "incoming") return;

              const target = isGroupCall ? roomName : data.from;

              socketActions?.callReject?.(target, data.callId, "Không nghe máy", {
                callType: incomingCallType,
                durationSeconds: 0,
                caller: data.from,
                receiver: isGroupCall ? roomName : currentUser,
                isGroupCall,
                roomName,
                chatType: isGroupCall ? "room" : "people",
              });

              resetCall();
            }, CALL_TIMEOUT_MS);

            break;
          }

          case "CALL_ACCEPTED": {
            if (!currentState.callId || !data.callId || currentState.callId !== data.callId) return;

            const acceptedPeer = data.from;
            if (!acceptedPeer || acceptedPeer === currentUser) return;

            clearCallTimer();

            if (currentState.isGroupCall) {
              if (["incoming", "idle", "ending"].includes(currentState.status)) return;

              setCallState((previous) => ({
                ...previous,
                status: previous.status === "outgoing" ? "connecting" : previous.status,
                message: "Đang kết nối cuộc gọi nhóm...",
              }));

              await createAndSendOffer(acceptedPeer, data.callId, currentState.callType);
              return;
            }

            setCallState((previous) => ({
              ...previous,
              status: "connecting",
              message: "Đang kết nối...",
            }));

            const acceptedCallType =
              data.callType === "video" || currentState.callType === "video" ? "video" : "audio";

            await createAndSendOffer(acceptedPeer, data.callId, acceptedCallType);
            break;
          }

          case "CALL_REJECTED": {
            if (currentState.callId && data.callId && currentState.callId !== data.callId) return;

            if (currentState.isGroupCall) {
              const rejectedPeer = data.from;

              if (rejectedPeer && rejectedPeer !== currentUser) {
                closePeerConnection(rejectedPeer);
              }

              if (currentState.status === "outgoing" && peerConnectionsRef.current.size === 0) {
                setCallState((previous) => ({
                  ...previous,
                  message: `${rejectedPeer || "Một thành viên"} đã từ chối`,
                }));
              }

              return;
            }

            clearCallTimer();

            setCallState((previous) => ({
              ...previous,
              status: "ending",
              message: "Cuộc gọi đã bị từ chối",
            }));

            window.setTimeout(resetCall, 650);
            break;
          }

          case "CALL_CANCELED": {
            if (currentState.callId && data.callId && currentState.callId !== data.callId) return;

            clearCallTimer();

            setCallState((previous) => ({
              ...previous,
              status: "ending",
              message: "Cuộc gọi đã bị hủy",
            }));

            window.setTimeout(resetCall, 650);
            break;
          }

          case "CALL_ENDED": {
            if (currentState.callId && data.callId && currentState.callId !== data.callId) return;

            const isGroupCall = Boolean(
              currentState.isGroupCall || data.isGroupCall || data.roomName || data.chatType === "room",
            );

            if (isGroupCall) {
              const leavingPeer = getPeerFromSignal(data, currentUser);

              if (leavingPeer && leavingPeer !== currentUser) {
                closePeerConnection(leavingPeer);
              }

              const remainingPeerCount = peerConnectionsRef.current.size;

              if (remainingPeerCount > 0) {
                clearCallTimer();

                setCallState((previous) => ({
                  ...previous,
                  status: previous.status === "idle" ? "idle" : "connected",
                  message: leavingPeer
                    ? `${leavingPeer} đã rời cuộc gọi nhóm`
                    : "Một thành viên đã rời cuộc gọi nhóm",
                }));

                return;
              }

              clearCallTimer();

              setCallState((previous) => ({
                ...previous,
                status: "ending",
                message: "Cuộc gọi nhóm đã kết thúc",
              }));

              window.setTimeout(resetCall, 650);
              break;
            }

            clearCallTimer();

            setCallState((previous) => ({
              ...previous,
              status: "ending",
              message: "Cuộc gọi đã kết thúc",
            }));

            window.setTimeout(resetCall, 650);
            break;
          }

          case "WEBRTC_OFFER": {
            if (!data.offer || data.from === currentUser) return;
            if (currentState.callId && data.callId && currentState.callId !== data.callId) return;

            const peerUsername = getPeerFromSignal(data, currentUser);
            if (!peerUsername || peerUsername === currentUser) return;

            const callType = data.callType === "video" || currentState.callType === "video" ? "video" : "audio";
            const isGroupCall = Boolean(data.isGroupCall || data.roomName || currentState.isGroupCall);
            const roomName = data.roomName || currentState.roomName || "";

            await ensureLocalStream(callType);

            setCallState((previous) => ({
              ...previous,
              status: "connecting",
              callId: data.callId,
              peerUsername: previous.peerUsername || peerUsername,
              callType,
              direction: previous.direction || "incoming",
              message: isGroupCall ? "Đang kết nối cuộc gọi nhóm..." : "Đang kết nối...",
              isGroupCall,
              roomName,
            }));

            const peerConnection = createPeerConnection(peerUsername, data.callId);
            if (!peerConnection) return;

            addLocalTracksToPeer(peerUsername, peerConnection);

            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            await flushPendingIceCandidates(peerUsername);

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socketActions?.sendWebRTCAnswer?.(peerUsername, data.callId, answer, callType, {
              callType,
              isGroupCall,
              roomName,
              chatType: isGroupCall ? "room" : "people",
            });

            break;
          }

          case "WEBRTC_ANSWER": {
            if (!data.answer || !currentState.callId || currentState.callId !== data.callId) return;

            const peerUsername = getPeerFromSignal(data, currentUser);
            const peerConnection = peerConnectionsRef.current.get(peerUsername);
            if (!peerConnection) return;

            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            await flushPendingIceCandidates(peerUsername);

            clearCallTimer();

            if (!callConnectedAtRef.current) {
              callConnectedAtRef.current = Date.now();
            }

            setCallState((previous) => ({
              ...previous,
              status: "connected",
              message: previous.isGroupCall ? "Đang trong cuộc gọi nhóm" : "Đang trong cuộc gọi",
            }));

            break;
          }

          case "WEBRTC_ICE_CANDIDATE": {
            if (!data.candidate) return;
            if (currentState.callId && data.callId && currentState.callId !== data.callId) return;

            const peerUsername = getPeerFromSignal(data, currentUser);
            if (!peerUsername || peerUsername === currentUser) return;

            const peerConnection = peerConnectionsRef.current.get(peerUsername);

            if (!peerConnection || !peerConnection.remoteDescription) {
              const candidates = pendingIceCandidatesRef.current.get(peerUsername) || [];
              candidates.push(data.candidate);
              pendingIceCandidatesRef.current.set(peerUsername, candidates);
              return;
            }

            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error("Lỗi xử lý tín hiệu WebRTC:", error);
        window.alert("Không thể thiết lập cuộc gọi. Vui lòng thử lại.");
        resetCall();
      }
    };

    window.addEventListener("webrtc-call-signal", handleCallSignal);

    return () => {
      window.removeEventListener("webrtc-call-signal", handleCallSignal);
    };
  }, [
    addLocalTracksToPeer,
    clearCallTimer,
    closePeerConnection,
    createAndSendOffer,
    createPeerConnection,
    currentUser,
    ensureLocalStream,
    flushPendingIceCandidates,
    resetCall,
    socketActions,
  ]);

  useEffect(() => {
    return () => {
      closeAllPeerConnections();
      stopLocalStream();
    };
  }, [closeAllPeerConnections, stopLocalStream]);

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    peerStreams,
    isMicOn,
    isCameraOn,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
  };
};