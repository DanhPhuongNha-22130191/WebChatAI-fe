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
};

const getCandidatePayload = (candidate) => {
  if (!candidate) return null;

  if (typeof candidate.toJSON === "function") {
    return candidate.toJSON();
  }

  return candidate;
};

const isCallMatch = (state, data) => {
  if (!state?.callId || !data?.callId) return false;
  return state.callId === data.callId;
};

export const useWebRTCCall = ({ socketActions, currentUser }) => {
  const [callState, setCallState] = useState(IDLE_STATE);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [localStreamVersion, setLocalStreamVersion] = useState(0);
  const [remoteStreamVersion, setRemoteStreamVersion] = useState(0);

  const stateRef = useRef(callState);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const localTracksAddedRef = useRef(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const callConnectedAtRef = useRef(null);

  useEffect(() => {
    stateRef.current = callState;
  }, [callState]);

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

  const buildCallMeta = useCallback(
    (state, overrides = {}) => ({
      callType: state?.callType || "audio",
      durationSeconds: getCallDurationSeconds(),
      caller: state?.direction === "incoming" ? state?.peerUsername : currentUser,
      receiver: state?.direction === "incoming" ? currentUser : state?.peerUsername,
      ...overrides,
    }),
    [currentUser, getCallDurationSeconds],
  );


  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStreamVersion((value) => value + 1);
    }
  }, []);

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    localTracksAddedRef.current = false;
    pendingIceCandidatesRef.current = [];
    remoteStreamRef.current = null;
    setRemoteStreamVersion((value) => value + 1);
  }, []);

  const resetCall = useCallback(() => {
    clearCallTimer();
    callConnectedAtRef.current = null;
    closePeerConnection();
    stopLocalStream();
    setIsMicOn(true);
    setIsCameraOn(true);
    setCallState(IDLE_STATE);
  }, [clearCallTimer, closePeerConnection, stopLocalStream]);

  const addLocalTracksToPeer = useCallback((peerConnection) => {
    if (!peerConnection || !localStreamRef.current || localTracksAddedRef.current) {
      return;
    }

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    localTracksAddedRef.current = true;
  }, []);

  const flushPendingIceCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection || !peerConnection.remoteDescription) return;

    const candidates = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

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
      if (peerConnectionRef.current) {
        return peerConnectionRef.current;
      }

      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate || !socketActions?.sendIceCandidate) return;

        socketActions.sendIceCandidate(
          peerUsername,
          callId,
          getCandidatePayload(event.candidate),
        );
      };

      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
        } else {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }

          remoteStreamRef.current.addTrack(event.track);
        }

        setRemoteStreamVersion((value) => value + 1);
        clearCallTimer();
        if (!callConnectedAtRef.current) {
          callConnectedAtRef.current = Date.now();
        }

        setCallState((previous) => ({
          ...previous,
          status: "connected",
          message: "Đang trong cuộc gọi",
        }));
      };

      peerConnection.onconnectionstatechange = () => {
        const status = peerConnection.connectionState;

        if (status === "connected") {
          setCallState((previous) => ({
            ...previous,
            status: "connected",
            message: "Đang trong cuộc gọi",
          }));
        }

        if (["failed", "disconnected"].includes(status)) {
          setCallState((previous) => ({
            ...previous,
            message: "Kết nối cuộc gọi đang không ổn định",
          }));
        }

        if (status === "closed") {
          setCallState(IDLE_STATE);
        }
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    },
    [clearCallTimer, socketActions],
  );

  const ensureLocalStream = useCallback(async (callType) => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Trình duyệt không hỗ trợ microphone/camera.");
    }

    const shouldUseVideo = callType === "video";
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
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
      const peerConnection = createPeerConnection(peerUsername, callId);
      addLocalTracksToPeer(peerConnection);

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnection.setLocalDescription(offer);
      socketActions?.sendWebRTCOffer?.(peerUsername, callId, offer, callType);
    },
    [addLocalTracksToPeer, createPeerConnection, socketActions],
  );

  const startCall = useCallback(
    async (peerUsername, callType = "audio") => {
      const normalizedType = callType === "video" ? "video" : "audio";

      if (!peerUsername || !socketActions?.callInvite) return;

      if (stateRef.current.status !== "idle") {
        window.alert("Bạn đang có một cuộc gọi khác.");
        return;
      }

      try {
        await ensureLocalStream(normalizedType);

        const callId = `${currentUser || "me"}_${peerUsername}_${Date.now()}`;

        setCallState({
          status: "outgoing",
          callId,
          peerUsername,
          callType: normalizedType,
          direction: "outgoing",
          message: "Đang gọi...",
        });

        socketActions.callInvite(peerUsername, normalizedType, callId);

        clearCallTimer();
        callTimerRef.current = window.setTimeout(() => {
          const latestState = stateRef.current;

          if (latestState.callId !== callId || latestState.status !== "outgoing") {
            return;
          }

          socketActions?.callCancel?.(peerUsername, callId, {
            callType: normalizedType,
            durationSeconds: 0,
            caller: currentUser,
            receiver: peerUsername,
            reason: "Không nghe máy",
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
        message: "Đang kết nối...",
      }));

      socketActions?.callAccept?.(
        currentState.peerUsername,
        currentState.callId,
        currentState.callType,
      );
    } catch (error) {
      console.error("Không thể nhận cuộc gọi:", error);
      socketActions?.callReject?.(
        currentState.peerUsername,
        currentState.callId,
        "Không thể mở microphone/camera",
        buildCallMeta(currentState, { durationSeconds: 0 }),
      );
      window.alert(error?.message || "Không thể mở microphone/camera.");
      resetCall();
    }
  }, [buildCallMeta, clearCallTimer, ensureLocalStream, resetCall, socketActions]);

  const rejectCall = useCallback(
    (reason = "Từ chối cuộc gọi") => {
      const currentState = stateRef.current;

      if (currentState.peerUsername && currentState.callId) {
        socketActions?.callReject?.(
          currentState.peerUsername,
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

    if (currentState.peerUsername && currentState.callId) {
      if (currentState.status === "incoming") {
        socketActions?.callReject?.(
          currentState.peerUsername,
          currentState.callId,
          "Không nghe máy",
          buildCallMeta(currentState, { durationSeconds: 0 }),
        );
      } else if (currentState.status === "outgoing") {
        socketActions?.callCancel?.(
          currentState.peerUsername,
          currentState.callId,
          buildCallMeta(currentState, { durationSeconds: 0, reason: "Không nghe máy" }),
        );
      } else {
        socketActions?.callEnd?.(
          currentState.peerUsername,
          currentState.callId,
          buildCallMeta(currentState),
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
        if (["CALL_INVITE", "CALL_ACCEPT", "WEBRTC_OFFER", "WEBRTC_ANSWER", "WEBRTC_ICE_CANDIDATE"].includes(eventName)) {
          window.alert(response.message || "Cuộc gọi không thể thực hiện.");
          resetCall();
        }
        return;
      }

      try {
        switch (eventName) {
          case "CALL_INVITE": {
            if (data.from === currentUser) return;

            if (currentState.status !== "idle") {
              socketActions?.callReject?.(data.from, data.callId, "Người dùng đang bận", {
                callType: data.callType === "video" ? "video" : "audio",
                durationSeconds: 0,
                caller: data.from,
                receiver: currentUser,
              });
              return;
            }

            const incomingCallType = data.callType === "video" ? "video" : "audio";

            setCallState({
              status: "incoming",
              callId: data.callId,
              peerUsername: data.from,
              callType: incomingCallType,
              direction: "incoming",
              message: "Cuộc gọi đến",
            });

            clearCallTimer();
            callTimerRef.current = window.setTimeout(() => {
              const latestState = stateRef.current;

              if (latestState.callId !== data.callId || latestState.status !== "incoming") {
                return;
              }

              socketActions?.callReject?.(data.from, data.callId, "Không nghe máy", {
                callType: incomingCallType,
                durationSeconds: 0,
                caller: data.from,
                receiver: currentUser,
              });
              resetCall();
            }, CALL_TIMEOUT_MS);
            break;
          }

          case "CALL_ACCEPTED": {
            if (!isCallMatch(currentState, data)) return;

            clearCallTimer();

            setCallState((previous) => ({
              ...previous,
              status: "connecting",
              message: "Đang kết nối...",
            }));

            const acceptedCallType = data.callType === "video" || currentState.callType === "video" ? "video" : "audio";
            await createAndSendOffer(data.from, data.callId, acceptedCallType);
            break;
          }

          case "CALL_REJECTED":
          case "CALL_CANCELED":
          case "CALL_ENDED": {
            if (currentState.callId && data.callId && currentState.callId !== data.callId) {
              return;
            }

            clearCallTimer();

            setCallState((previous) => ({
              ...previous,
              status: "ending",
              message:
                eventName === "CALL_REJECTED"
                  ? "Cuộc gọi đã bị từ chối"
                  : "Cuộc gọi đã kết thúc",
            }));

            window.setTimeout(resetCall, 650);
            break;
          }

          case "WEBRTC_OFFER": {
            if (!data.offer || data.from === currentUser) return;

            if (currentState.callId && data.callId && currentState.callId !== data.callId) {
              return;
            }

            const callType = data.callType === "video" || currentState.callType === "video" ? "video" : "audio";
            await ensureLocalStream(callType);

            setCallState({
              status: "connecting",
              callId: data.callId,
              peerUsername: data.from,
              callType,
              direction: currentState.direction || "incoming",
              message: "Đang kết nối...",
            });

            const peerConnection = createPeerConnection(data.from, data.callId);
            addLocalTracksToPeer(peerConnection);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            await flushPendingIceCandidates();

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketActions?.sendWebRTCAnswer?.(data.from, data.callId, answer, callType);
            break;
          }

          case "WEBRTC_ANSWER": {
            if (!data.answer || !isCallMatch(currentState, data)) return;

            const peerConnection = peerConnectionRef.current;
            if (!peerConnection) return;

            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            await flushPendingIceCandidates();

            setCallState((previous) => ({
              ...previous,
              status: "connected",
              message: "Đang trong cuộc gọi",
            }));
            break;
          }

          case "WEBRTC_ICE_CANDIDATE": {
            if (!data.candidate) return;

            if (currentState.callId && data.callId && currentState.callId !== data.callId) {
              return;
            }

            const peerConnection = peerConnectionRef.current;

            if (!peerConnection || !peerConnection.remoteDescription) {
              pendingIceCandidatesRef.current.push(data.candidate);
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
    return () => window.removeEventListener("webrtc-call-signal", handleCallSignal);
  }, [
    addLocalTracksToPeer,
    clearCallTimer,
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
      closePeerConnection();
      stopLocalStream();
    };
  }, [closePeerConnection, stopLocalStream]);

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
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
