import React from "react";
import { getAvatarUrl } from "../../../../shared/utils/avatarUtils.js";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(24, 14, 22, 0.74)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "min(960px, 94vw)",
    height: "min(720px, calc(100vh - 48px))",
    maxHeight: "calc(100vh - 48px)",
    borderRadius: 28,
    background: "linear-gradient(145deg, #2b1524 0%, #120910 100%)",
    color: "#fff",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 24px 90px rgba(0,0,0,0.42)",
    display: "flex",
    flexDirection: "column",
  },

  topBar: {
    flexShrink: 0,
    padding: "18px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
  },

  subtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
  },

  body: {
    flex: 1,
    minHeight: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  remoteVideo: {
    width: "100%",
    height: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    borderRadius: 24,
    background: "#080407",
  },

  localVideo: {
    position: "absolute",
    right: 28,
    bottom: 28,
    width: "min(190px, 28vw)",
    height: 132,
    borderRadius: 18,
    objectFit: "cover",
    background: "#0f080d",
    border: "2px solid rgba(255,255,255,0.6)",
    boxShadow: "0 10px 34px rgba(0,0,0,0.35)",
    zIndex: 10,
  },

  audioPanel: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  avatar: {
    width: 144,
    height: 144,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid rgba(255,255,255,0.25)",
    boxShadow: "0 16px 50px rgba(255,79,152,0.18)",
  },

  peerName: {
    fontSize: 28,
    fontWeight: 800,
    margin: "8px 0 0",
  },

  controls: {
    flexShrink: 0,
    minHeight: 98,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: "14px 20px 24px",
    background:
      "linear-gradient(180deg, rgba(18,9,16,0) 0%, rgba(18,9,16,0.9) 100%)",
    position: "relative",
    zIndex: 30,
  },

  roundButton: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
    padding: 0,
    lineHeight: 1,
  },

  labelButton: {
    height: 48,
    padding: "0 22px",
    borderRadius: 16,
    border: "none",
    color: "#fff",
    fontWeight: 750,
    cursor: "pointer",
    fontSize: 15,
  },
};

const MicIcon = ({ muted = false }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
    {muted && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

const CameraIcon = ({ off = false }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 8-6 4 6 4V8Z" />
    <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
    {off && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CallModal = ({
  callState,
  localVideoRef,
  remoteVideoRef,
  isMicOn,
  isCameraOn,
  onAccept,
  onReject,
  onEnd,
  onToggleMic,
  onToggleCamera,
}) => {
  if (!callState || callState.status === "idle") return null;

  const isIncoming = callState.status === "incoming";
  const isVideoCall = callState.callType === "video";
  const peerName = callState.peerUsername || "Người dùng";
  const statusText = callState.message || "Đang kết nối...";

  const title = isIncoming
    ? `${isVideoCall ? "Video call" : "Voice call"} đến`
    : isVideoCall
      ? "Video call"
      : "Voice call";

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.title}>{title}</h2>
            <p style={styles.subtitle}>{statusText}</p>
          </div>

          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>
            WebRTC
          </div>
        </div>

        <div style={styles.body}>
          {isVideoCall ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={styles.remoteVideo}
              />

              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={styles.localVideo}
              />

              {callState.status !== "connected" && (
                <div
                  style={{
                    ...styles.audioPanel,
                    position: "absolute",
                    inset: 20,
                    borderRadius: 24,
                    background: "rgba(8,4,7,0.62)",
                    pointerEvents: "none",
                    zIndex: 8,
                  }}
                >
                  <img
                    src={getAvatarUrl(peerName, 256)}
                    alt={peerName}
                    style={styles.avatar}
                  />
                  <div style={styles.peerName}>{peerName}</div>
                  <div style={{ color: "rgba(255,255,255,0.72)" }}>
                    {statusText}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.audioPanel}>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ display: "none" }}
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ display: "none" }}
              />

              <img
                src={getAvatarUrl(peerName, 256)}
                alt={peerName}
                style={styles.avatar}
              />

              <div style={styles.peerName}>{peerName}</div>

              <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 15 }}>
                {statusText}
              </div>
            </div>
          )}
        </div>

        <div style={styles.controls}>
          {isIncoming ? (
            <>
              <button
                type="button"
                onClick={onReject}
                style={{ ...styles.labelButton, background: "#ef3f5f" }}
              >
                Từ chối
              </button>

              <button
                type="button"
                onClick={onAccept}
                style={{ ...styles.labelButton, background: "#24c36b" }}
              >
                Nghe máy
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleMic}
                title={isMicOn ? "Tắt mic" : "Bật mic"}
                style={{
                  ...styles.roundButton,
                  background: isMicOn
                    ? "rgba(255,255,255,0.16)"
                    : "#ef9a24",
                }}
              >
                <MicIcon muted={!isMicOn} />
              </button>

              {isVideoCall && (
                <button
                  type="button"
                  onClick={onToggleCamera}
                  title={isCameraOn ? "Tắt camera" : "Bật camera"}
                  style={{
                    ...styles.roundButton,
                    background: isCameraOn
                      ? "rgba(255,255,255,0.16)"
                      : "#ef9a24",
                  }}
                >
                  <CameraIcon off={!isCameraOn} />
                </button>
              )}

              <button
                type="button"
                onClick={onEnd}
                title="Kết thúc cuộc gọi"
                style={{
                  ...styles.roundButton,
                  background: "#ef3f5f",
                  transform: "rotate(135deg)",
                }}
              >
                <PhoneIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;