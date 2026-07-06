import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../../../../state/chat/chatSlice";
import EmojiPicker from "emoji-picker-react";
import styles from "./ChatRoomCard.module.css";
import Loading from "../../../../shared/components/Loading";
import ImageModal from "../../../../shared/components/ImageModal";
import { useSocket } from "../../../../app/providers/useSocket.js";
import { parseRoomInvite } from "../../../../shared/utils/parseRoomInvite.js";
import { getAvatarUrl, getDisplayName } from "../../../../shared/utils/avatarUtils.js";
import { decodeEmoji } from "../../../../shared/utils/emojiUtils.js";
import {
  parseCallLog,
  getCallLogTitle,
  formatCallDuration,
} from "../../../../shared/utils/callLogUtils.js";
import {
  createStickerCode,
  getStickerUrl,
  isStickerMessage,
} from "../../../../shared/utils/stickerUtils";
import StickerPicker from "./StickerPicker";
const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];
import ChatSummaryModal from './ChatSummaryModal.jsx';

const modalStyles = {
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 500,
    background: "rgba(38, 24, 36, 0.46)",
    backdropFilter: "blur(7px)",
    WebkitBackdropFilter: "blur(7px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "min(430px, 100%)",
    borderRadius: 24,
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 22px 65px rgba(83, 29, 55, 0.27)",
    animation: "chatActionModalAppear 0.18s ease-out",
  },
  header: {
    padding: "19px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(120deg, #ff4f98 0%, #d52d70 100%)",
    color: "#fff",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "none",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: 23,
    lineHeight: 1,
  },
  secondaryButton: {
    flex: 1,
    height: 47,
    borderRadius: 13,
    border: "1px solid #eadde3",
    background: "#faf6f8",
    color: "#66515b",
    fontSize: 14.5,
    fontWeight: 650,
    transition: "all 0.17s ease",
  },
  primaryButton: {
    flex: 1.12,
    height: 47,
    borderRadius: 13,
    border: "none",
    background: "linear-gradient(120deg, #ff4f98 0%, #d52d70 100%)",
    color: "#fff",
    fontSize: 14.5,
    fontWeight: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 18px rgba(209, 34, 101, 0.21)",
    transition: "all 0.17s ease",
  },
};

const ModalAnimationStyle = () => (
  <style>{`
        @keyframes chatActionModalAppear {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatActionModalSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .chat-action-secondary:hover:not(:disabled) {
            background: #fff0f6 !important;
            border-color: #ffd1e3 !important;
        }
        .chat-action-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            filter: brightness(1.04);
            box-shadow: 0 11px 23px rgba(209, 34, 101, 0.29) !important;
        }
    `}</style>
);

const ModalSpinner = () => (
  <span
    style={{
      width: 15,
      height: 15,
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.38)",
      borderTopColor: "#fff",
      animation: "chatActionModalSpin 0.7s linear infinite",
    }}
  />
);

const RecallConfirmModal = ({ message, isSubmitting, onClose, onConfirm }) => {
  if (!message) return null;

  const rawText = typeof message.mes === "string" ? message.mes : "";

  const getPreviewText = () => {
    if (rawText.startsWith("[IMAGE]")) return "🖼️ Hình ảnh";
    if (rawText.startsWith("[VIDEO]")) return "🎬 Video";
    if (rawText.startsWith("[FILE]")) return "📎 Tệp đính kèm";
    if (isStickerMessage(rawText)) return "✨ Sticker";
    if (!rawText.trim()) return "Tin nhắn này";
    return rawText.length > 82 ? `${rawText.slice(0, 82)}...` : rawText;
  };

  return (
    <div
      style={modalStyles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <ModalAnimationStyle />
      <div
        style={modalStyles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recall-modal-title"
      >
        <div style={modalStyles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={modalStyles.icon}>↩</div>
            <div>
              <h3
                id="recall-modal-title"
                style={{ margin: 0, fontSize: 19, fontWeight: 750 }}
              >
                Thu hồi tin nhắn
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, opacity: 0.9 }}>
                Xác nhận trước khi thực hiện
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            style={{
              ...modalStyles.closeButton,
              cursor: isSubmitting ? "default" : "pointer",
              opacity: isSubmitting ? 0.55 : 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px 24px 18px" }}>
          <p
            style={{
              margin: "0 0 15px",
              color: "#4b3942",
              fontSize: 15,
              lineHeight: 1.55,
            }}
          >
            Bạn có chắc muốn thu hồi tin nhắn này không?
          </p>
          <div
            style={{
              padding: "13px 15px",
              borderRadius: 14,
              border: "1px solid #f4d3e0",
              background: "#fff7fa",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#bd4772",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}
            >
              Tin nhắn của bạn
            </div>
            <div style={{ fontSize: 14, color: "#5a424c", lineHeight: 1.4 }}>
              {getPreviewText()}
            </div>
          </div>
          <p
            style={{
              margin: "13px 0 0",
              color: "#8f737f",
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            Sau khi thu hồi, mọi người sẽ chỉ thấy dòng{" "}
            <b style={{ color: "#c53269" }}>“Tin nhắn đã được thu hồi”</b>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, padding: "0 24px 24px" }}>
          <button
            type="button"
            className="chat-action-secondary"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              ...modalStyles.secondaryButton,
              cursor: isSubmitting ? "default" : "pointer",
            }}
          >
            Giữ lại
          </button>
          <button
            type="button"
            className="chat-action-primary"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              ...modalStyles.primaryButton,
              cursor: isSubmitting ? "default" : "pointer",
              opacity: isSubmitting ? 0.72 : 1,
            }}
          >
            {isSubmitting && <ModalSpinner />}
            {isSubmitting ? "Đang thu hồi..." : "Thu hồi"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditMessageModal = ({
  message,
  value,
  error,
  isSubmitting,
  onChange,
  onClose,
  onConfirm,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (message && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div
      style={modalStyles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <ModalAnimationStyle />
      <div
        style={modalStyles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <div style={modalStyles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={modalStyles.icon}>
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <div>
              <h3
                id="edit-modal-title"
                style={{ margin: 0, fontSize: 19, fontWeight: 750 }}
              >
                Chỉnh sửa tin nhắn
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, opacity: 0.9 }}>
                Cập nhật nội dung đã gửi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            style={{
              ...modalStyles.closeButton,
              cursor: isSubmitting ? "default" : "pointer",
              opacity: isSubmitting ? 0.55 : 1,
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          <div style={{ padding: "23px 24px 18px" }}>
            <label
              style={{
                display: "block",
                color: "#5a424c",
                fontSize: 13,
                fontWeight: 650,
                marginBottom: 8,
              }}
            >
              Nội dung mới
            </label>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={isSubmitting}
              maxLength={2000}
              rows={4}
              placeholder="Nhập nội dung tin nhắn..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "none",
                borderRadius: 14,
                border: error ? "1.5px solid #e1496f" : "1.5px solid #f0cbd9",
                background: "#fff9fb",
                padding: "12px 13px",
                outline: "none",
                color: "#4d3741",
                fontFamily: "inherit",
                fontSize: 14.5,
                lineHeight: 1.45,
                boxShadow: error ? "0 0 0 3px rgba(225,73,111,0.09)" : "none",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 6,
              }}
            >
              <span style={{ minHeight: 18, fontSize: 12.5, color: "#da315f" }}>
                {error || ""}
              </span>
              <span
                style={{ fontSize: 12, color: "#a28b95", whiteSpace: "nowrap" }}
              >
                {value.length}/2000
              </span>
            </div>
            <p
              style={{
                margin: "10px 0 0",
                color: "#8f737f",
                fontSize: 12.5,
                lineHeight: 1.45,
              }}
            >
              Người nhận sẽ thấy nhãn{" "}
              <b style={{ color: "#c53269" }}>“Đã chỉnh sửa”</b> dưới tin nhắn.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, padding: "0 24px 24px" }}>
            <button
              type="button"
              className="chat-action-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                ...modalStyles.secondaryButton,
                cursor: isSubmitting ? "default" : "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="chat-action-primary"
              disabled={isSubmitting}
              style={{
                ...modalStyles.primaryButton,
                cursor: isSubmitting ? "default" : "pointer",
                opacity: isSubmitting ? 0.72 : 1,
              }}
            >
              {isSubmitting && <ModalSpinner />}
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChatRoomCard = ({
  activeChat,
  messages,
  myUsername,
  isOnline,
  inputText,
  setInputText,
  page,
  isLoading,
  handleSend,
  handleScroll,
  messagesEndRef,
  chatContainerRef,
  onInfoClick,
  selectedFile,
  isUploading,
  handleSelectFile,
  handleRemoveFile,
  onRetry,
  isSocketReady,
  activeTypingUsers,
  onVoiceCall,
  onVideoCall,
}) => {
  const dispatch = useDispatch();
  const { actions: socketActions } = useSocket();

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const stickerPickerRef = useRef(null);
  const stickerButtonRef = useRef(null);
  const menuRef = useRef(null);

    const [previewImage, setPreviewImage] = useState(null);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [recallingId, setRecallingId] = useState(null);
    const [recallTargetMessage, setRecallTargetMessage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTargetMessage, setEditTargetMessage] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [editError, setEditError] = useState('');
    const [summaryOpen, setSummaryOpen] = useState(false);

  const currentUsername =
    myUsername ||
    sessionStorage.getItem("user_name") ||
    localStorage.getItem("user_name") ||
    "";

  const isPeopleChat = activeChat?.type === 0 || activeChat?.type === "people";
  const activeChatTitle = getDisplayName(activeChat);

  const getSenderDisplayName = (senderName) => {
    if (isPeopleChat && senderName === activeChat?.name) {
      return activeChatTitle;
    }

    return senderName;
  };

  const getSenderAvatar = (senderName, size = 32) => {
    if (isPeopleChat && senderName === activeChat?.name) {
      return getAvatarUrl(activeChatTitle, size, activeChat?.avatar);
    }

    return getAvatarUrl(senderName, size);
  };

  const handleJoinRoom = useCallback(
    (roomName) => {
      if (!roomName || !socketActions) return;

      const senderName = currentUsername || "Ai đó";

      socketActions.joinRoom(roomName);

      setTimeout(() => {
        socketActions.sendChat(
          roomName,
          `${senderName} đã tham gia nhóm`,
          "room",
        );
        socketActions.roomHistory(roomName, 1);
      }, 400);
    },
    [socketActions, currentUsername],
  );

  const parseTime = (timeStr) => {
    if (!timeStr) return new Date();
    return new Date(timeStr);
  };

  const shouldShowTimestamp = (currentMsg, previousMsg) => {
    if (!previousMsg) return true;
    if (!currentMsg.createAt || !previousMsg.createAt) return true;

    const currentTime = parseTime(currentMsg.createAt);
    const previousTime = parseTime(previousMsg.createAt);

    if (
      Number.isNaN(currentTime.getTime()) ||
      Number.isNaN(previousTime.getTime())
    ) {
      return true;
    }

    return (currentTime - previousTime) / 1000 / 60 > 30;
  };

  const formatTimeFull = (timeStr) => {
    return parseTime(timeStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeShort = (timeStr) => {
    if (!timeStr) return "";

    return parseTime(timeStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isSameMinute = (firstTime, secondTime) => {
    if (!firstTime || !secondTime) return false;

    const first = parseTime(firstTime);
    const second = parseTime(secondTime);

    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate() &&
      first.getHours() === second.getHours() &&
      first.getMinutes() === second.getMinutes()
    );
  };

  const isEmojiOnly = (text) => {
    if (!text) return false;
    const emojiRegex =
      /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u;
    return emojiRegex.test(text);
  };

  const isEditableContent = (text) => {
    const normalized = typeof text === "string" ? text.trim() : "";

    if (!normalized) return false;

    return (
      !normalized.startsWith("[IMAGE]") &&
      !normalized.startsWith("[VIDEO]") &&
      !normalized.startsWith("[FILE]") &&
      !isStickerMessage(normalized) &&
      !parseRoomInvite(normalized)
    );
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onEmojiClick = (emojiObject) => {
    setInputText((previousText) => previousText + emojiObject.emoji);
  };

  const handleStickerSelect = (sticker) => {
    if (!activeChat) return;
    setSelectedSticker(sticker);
    setShowStickerPicker(false);
  };

  const handleReactMessage = (messageId, reaction) => {
    if (!messageId || !socketActions?.reactMessage) return;

    socketActions.reactMessage(messageId, reaction);
    setOpenMenuId(null);
  };

  const openRecallModal = (message) => {
    if (!message?.id) {
      window.alert("Tin nhắn chưa gửi xong nên chưa thể thu hồi.");
      return;
    }

    if (!socketActions?.recallMessage) {
      window.alert("Chức năng thu hồi chưa được kết nối.");
      return;
    }

    setOpenMenuId(null);
    setRecallTargetMessage(message);
  };

  const closeRecallModal = () => {
    if (recallingId !== null) return;
    setRecallTargetMessage(null);
  };

  const confirmRecallMessage = () => {
    if (!recallTargetMessage?.id || !socketActions?.recallMessage) return;

    setRecallingId(recallTargetMessage.id);
    socketActions.recallMessage(recallTargetMessage.id);

    setTimeout(() => {
      setRecallingId(null);
      setRecallTargetMessage(null);
    }, 650);
  };

  const openEditModal = (message) => {
    const currentContent = typeof message?.mes === "string" ? message.mes : "";

    if (!message?.id) {
      window.alert("Tin nhắn chưa gửi xong nên chưa thể chỉnh sửa.");
      return;
    }

    if (!isEditableContent(currentContent)) {
      window.alert("Chỉ hỗ trợ chỉnh sửa tin nhắn chữ hoặc emoji.");
      return;
    }

    if (!socketActions?.editMessage) {
      window.alert("Chức năng chỉnh sửa chưa được kết nối.");
      return;
    }

    setOpenMenuId(null);
    setEditError("");
    setEditDraft(currentContent);
    setEditTargetMessage(message);
  };

  const closeEditModal = () => {
    if (editingId !== null) return;
    setEditTargetMessage(null);
    setEditDraft("");
    setEditError("");
  };

  const confirmEditMessage = () => {
    if (!editTargetMessage?.id || !socketActions?.editMessage) return;

    const normalizedContent = editDraft.trim();
    const originalContent =
      typeof editTargetMessage.mes === "string"
        ? editTargetMessage.mes.trim()
        : "";

    if (!normalizedContent) {
      setEditError("Nội dung tin nhắn không được để trống.");
      return;
    }

    if (normalizedContent === originalContent) {
      setEditError("Bạn chưa thay đổi nội dung tin nhắn.");
      return;
    }

    if (!isEditableContent(normalizedContent)) {
      setEditError("Chỉ hỗ trợ chỉnh sửa tin nhắn chữ hoặc emoji.");
      return;
    }

    setEditError("");
    setEditingId(editTargetMessage.id);
    socketActions.editMessage(editTargetMessage.id, normalizedContent);

    setTimeout(() => {
      setEditingId(null);
      setEditTargetMessage(null);
      setEditDraft("");
    }, 650);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (recallTargetMessage && recallingId === null) {
        setRecallTargetMessage(null);
      }

      if (editTargetMessage && editingId === null) {
        setEditTargetMessage(null);
        setEditDraft("");
        setEditError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recallTargetMessage, recallingId, editTargetMessage, editingId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        showStickerPicker &&
        stickerPickerRef.current &&
        !stickerPickerRef.current.contains(event.target) &&
        stickerButtonRef.current &&
        !stickerButtonRef.current.contains(event.target)
      ) {
        setShowStickerPicker(false);
      }

      if (
        openMenuId !== null &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker, showStickerPicker, openMenuId]);

  const renderCallLogCard = (callLog) => {
    if (!callLog) return null;

    const isVideoCall = callLog.callType === "video";
    const title = getCallLogTitle(callLog, currentUsername);
    const duration = formatCallDuration(callLog.durationSeconds || 0);

    const handleCallAgain = (event) => {
      event.stopPropagation();

      if (!isPeopleChat) return;

      if (isVideoCall) {
        onVideoCall?.();
      } else {
        onVoiceCall?.();
      }
    };

    return (
      <div className={styles.callLogCard}>
        <div className={styles.callLogIcon}>
          {isVideoCall ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 8-6 4 6 4V8Z" />
              <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          )}
        </div>

        <div className={styles.callLogInfo}>
          <div className={styles.callLogTitle}>{title}</div>
          <div className={styles.callLogDuration}>{duration}</div>
        </div>

        <button
          type="button"
          className={styles.callAgainButton}
          onClick={handleCallAgain}
          disabled={!isPeopleChat}
        >
          Gọi lại
        </button>
      </div>
    );
  };

  const renderFileMessage = (messageText) => {
    const fileContent = messageText.replace("[FILE]", "");
    const [url, fileName, fileSize] = fileContent.split("|");

    const formatSize = (bytes) => {
      if (!bytes) return "Unknown size";

      const size = Number(bytes);
      if (!Number.isFinite(size) || size <= 0) return "Unknown size";

      const units = ["Bytes", "KB", "MB", "GB"];
      const position = Math.floor(Math.log(size) / Math.log(1024));
      return `${parseFloat((size / Math.pow(1024, position)).toFixed(2))} ${units[position]}`;
    };

    const downloadUrl =
      url?.includes("cloudinary.com") &&
      url.includes("/upload/") &&
      !url.includes("/raw/") &&
      !url.toLowerCase().endsWith(".pdf")
        ? url.replace("/upload/", "/upload/fl_attachment/")
        : url;

    return (
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fileMessage}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.fileIcon}>
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{fileName || "Unknown File"}</span>
          <span className={styles.fileSize}>{formatSize(fileSize)}</span>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>
    );
  };

  const renderMessageContent = (messageText) => {
    const text = typeof messageText === "string" ? messageText : "";

    if (isStickerMessage(text)) {
      const stickerUrl = getStickerUrl(text);

      return stickerUrl ? (
        <img
          src={stickerUrl}
          alt="sticker"
          className={styles.stickerImage}
          onClick={() => setPreviewImage(stickerUrl)}
        />
      ) : (
        <span>[Sticker lỗi]</span>
      );
    }

    if (text.startsWith("[IMAGE]")) {
      const imageUrl = text.replace("[IMAGE]", "");

      return (
        <div className={styles.mediaWrapper}>
          <img
            src={imageUrl}
            alt="Sent"
            className={styles.sentImage}
            onClick={() => setPreviewImage(imageUrl)}
          />
        </div>
      );
    }

    if (text.startsWith("[VIDEO]")) {
      return (
        <div className={styles.mediaWrapper}>
          <video
            src={text.replace("[VIDEO]", "")}
            controls
            className={styles.sentVideo}
          />
        </div>
      );
    }

    if (text.startsWith("[FILE]")) {
      return (
        <div className={styles.mediaWrapper}>{renderFileMessage(text)}</div>
      );
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <span>
        {parts.map((part, index) =>
          part.match(urlRegex) ? (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.messageLink}
              onClick={(event) => event.stopPropagation()}
            >
              {part}
            </a>
          ) : (
            <span key={index}>{decodeEmoji(part)}</span>
          ),
        )}
      </span>
    );
  };

    const getSummaryConversationType = () => {
        return isPeopleChat ? 'people' : 'room';
    };

    const getSummaryTarget = () => {
        return activeChat?.name || '';
    };

    const handleOpenSummary = () => {
        if (!activeChat) return;
        setSummaryOpen(true);
    };

    const closeSummaryModal = () => {
        setSummaryOpen(false);
    };

  const submitMessage = (event) => {
    event.preventDefault();

    if (!selectedSticker) {
      handleSend(event);
      return;
    }

    if (!activeChat || !socketActions) return;

    const chatType = isPeopleChat ? "people" : "room";
    const stickerCode = createStickerCode(
      selectedSticker.id,
      selectedSticker.index,
    );

    dispatch(
      addMessage({
        name: currentUsername || "Tôi",
        mes: stickerCode,
        createAt: new Date().toISOString(),
        to: activeChat.name,
        type: chatType,
        tempId: Date.now().toString(),
        status: "sending",
      }),
    );

    socketActions.sendChat(activeChat.name, stickerCode, chatType);
    setSelectedSticker(null);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!activeChat) return null;

  return (
    <div className={styles.container}>
      {isLoading && page === 1 && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <Loading text="Đang tải tin nhắn..." />
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarContainer}>
            <img
              src={getAvatarUrl(activeChatTitle, 128, activeChat.avatar)}
              alt={activeChatTitle}
              className={styles.avatar}
            />
            {isPeopleChat && (
              <div
                className={isOnline ? styles.onlineDot : styles.offlineDot}
              />
            )}
          </div>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>
              {isPeopleChat && activeChat.name === currentUsername
                ? "Lưu trữ"
                : activeChatTitle}
            </h3>
          </div>
        </div>

        <div className={styles.headerRight}>
                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.aiSummaryButton}`}
                        title="Tóm tắt cuộc trò chuyện"
                        onClick={handleOpenSummary}
                        disabled={!activeChat}
                    >
                        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.7 5.2L19 10l-5.3 1.8L12 17l-1.7-5.2L5 10l5.3-1.8L12 3Z" />
                            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
                        </svg>
                    </button>
          <button
            type="button"
            className={styles.iconButton}
            title={isPeopleChat ? "Gọi thoại" : "Chỉ hỗ trợ gọi 1-1"}
            onClick={onVoiceCall}
            disabled={!isPeopleChat}
          >
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
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.iconButton}
            title={isPeopleChat ? "Gọi video" : "Chỉ hỗ trợ gọi 1-1"}
            onClick={onVideoCall}
            disabled={!isPeopleChat}
          >
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
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onInfoClick}
            title="Thông tin"
          >
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
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={styles.messagesArea}
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {isLoading && page > 1 && (
          <div className={styles.loadingMore}>
            <Loading text="Đang tải thêm tin nhắn..." />
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className={styles.emptyMessages}>
            Chưa có tin nhắn trong cuộc hội thoại này.
          </div>
        )}

        {messages.map((message, index) => {
          const isMe = (message.name || message.sender) === currentUsername;
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const nextMessage = messages[index + 1];
          const isRecalled =
            message.recalled === true || message.status === "recalled";
          const isEdited = message.edited === true && !isRecalled;
          const messageText = isRecalled
            ? "Tin nhắn đã được thu hồi"
            : message.mes || "";
          const invite = isRecalled ? null : parseRoomInvite(messageText);
          const showTimestamp = shouldShowTimestamp(message, previousMessage);
          const isLastInMinute =
            !nextMessage ||
            nextMessage.name !== message.name ||
            !isSameMinute(message.createAt, nextMessage.createAt);
          const isLastSent = isMe && index === messages.length - 1;
          const canRecall =
            isMe &&
            !isRecalled &&
            message.id != null &&
            message.status !== "sending" &&
            message.status !== "error";
          const canEdit = canRecall && isEditableContent(messageText);
          const isMedia =
            !isRecalled &&
            (messageText.startsWith("[IMAGE]") ||
              messageText.startsWith("[VIDEO]") ||
              messageText.startsWith("[FILE]") ||
              isStickerMessage(messageText) ||
              isEmojiOnly(messageText));
          const callLog = isRecalled ? null : parseCallLog(message);
          const hasMyReaction =
            Array.isArray(message.reactions) &&
            message.reactions.some((item) => item.username === currentUsername);

          if (callLog) {
            return (
              <div
                key={message.id || message.tempId || index}
                className={styles.messageRow}
              >
                {showTimestamp && (
                  <div className={styles.centerTimestamp}>
                    {formatTimeFull(message.createAt)}
                  </div>
                )}
                <div className={styles.callLogRow}>
                  {renderCallLogCard(callLog)}
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id || message.tempId || index}
              className={styles.messageRow}
            >
              {showTimestamp && (
                <div className={styles.centerTimestamp}>
                  {formatTimeFull(message.createAt)}
                </div>
              )}

              <div
                className={styles.messageContent}
                style={{ flexDirection: isMe ? "row-reverse" : "row" }}
              >
                {!isMe && (
                  <div className={styles.senderAvatarBlock}>
                    <img
                      src={getSenderAvatar(message.name, 32)}
                      alt={getSenderDisplayName(message.name)}
                      className={styles.smallAvatar}
                    />
                    <span className={styles.senderName}>{getSenderDisplayName(message.name)}</span>
                  </div>
                )}

                <div
                  className={
                    isMe ? styles.ownMessageColumn : styles.otherMessageColumn
                  }
                >
                  {invite ? (
                    <div className={styles.inviteBubble}>
                      <div className={styles.inviteTitle}>
                        Lời mời tham gia nhóm
                      </div>
                      <div className={styles.inviteText}>
                        {invite.from
                          ? `${invite.from} mời bạn tham gia nhóm`
                          : "Bạn được mời tham gia nhóm"}{" "}
                        <b>{invite.roomName}</b>
                      </div>
                      <button
                        type="button"
                        className={styles.joinRoomButton}
                        onClick={() => handleJoinRoom(invite.roomName)}
                      >
                        Tham gia nhóm
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${styles.bubbleLine} ${isMe ? styles.ownBubbleLine : ""}`}
                      >
                        {canRecall && (
                          <div
                            className={styles.messageMenuContainer}
                            ref={openMenuId === message.id ? menuRef : null}
                          >
                            <button
                              type="button"
                              className={styles.messageMenuButton}
                              title="Tùy chọn tin nhắn"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === message.id ? null : message.id,
                                );
                              }}
                            >
                              •••
                            </button>

                            <div className={styles.menuDivider} />

                            {openMenuId === message.id && (
                              <div className={styles.messageMenuDropdown}>
                                {canEdit && (
                                  <>
                                    <button
                                      type="button"
                                      className={styles.editButton}
                                      onClick={() => openEditModal(message)}
                                      disabled={editingId === message.id}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                      </svg>
                                      {editingId === message.id
                                        ? "Đang lưu..."
                                        : "Chỉnh sửa"}
                                    </button>
                                    <div className={styles.menuDivider} />
                                  </>
                                )}
                                <button
                                  type="button"
                                  className={styles.recallButton}
                                  onClick={() => openRecallModal(message)}
                                  disabled={recallingId === message.id}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="9 14 4 9 9 4" />
                                    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                                  </svg>
                                  {recallingId === message.id
                                    ? "Đang thu hồi..."
                                    : "Thu hồi"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`${styles.bubble} ${isRecalled ? styles.recalledBubble : ""} ${!isRecalled && isEmojiOnly(messageText) ? styles.emojiOnly : ""}`}
                          style={{
                            backgroundColor: isRecalled
                              ? undefined
                              : isMedia
                                ? "transparent"
                                : isMe
                                  ? "var(--theme-sender-bubble, #FF5596)"
                                  : "#fff",
                            color: isRecalled
                              ? undefined
                              : isMe
                                ? "var(--theme-text-on-primary, #fff)"
                                : "#000",
                            padding: isMedia ? 0 : undefined,
                            boxShadow: isMedia ? "none" : undefined,
                            border: isMedia ? "none" : undefined,
                          }}
                        >
                          {isRecalled ? (
                            <span className={styles.recalledText}>
                              Tin nhắn đã được thu hồi
                            </span>
                          ) : (
                            renderMessageContent(messageText)
                          )}

                          {isLastInMinute && (
                            <div
                              className={`${styles.messageTime} ${isMedia ? styles.mediaTime : ""}`}
                            >
                              {isEdited && (
                                <span className={styles.editedLabel}>
                                  Đã chỉnh sửa ·{" "}
                                </span>
                              )}
                              {formatTimeShort(message.createAt)}
                            </div>
                          )}

                          {Array.isArray(message.reactions) &&
                            message.reactions.length > 0 && (
                              <div
                                className={`${styles.reactionList} ${
                                  isMedia ? styles.mediaReactionList : ""
                                }`}
                              >
                                {Object.entries(
                                  message.reactions.reduce((acc, item) => {
                                    if (!acc[item.reaction]) {
                                      acc[item.reaction] = {
                                        count: 0,
                                        users: [],
                                      };
                                    }

                                    acc[item.reaction].count++;
                                    acc[item.reaction].users.push(
                                      item.username,
                                    );

                                    return acc;
                                  }, {}),
                                ).map(([emoji, data]) => (
                                  <span
                                    key={emoji}
                                    className={styles.reactionItem}
                                    title={data.users.join(", ")}
                                  >
                                    {emoji}
                                    {data.count > 1 && (
                                      <span className={styles.reactionCount}>
                                        {data.count}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>

                        {message.id != null && !isRecalled && (
                          <div
                            className={`${styles.quickReactionArea} ${
                              isMe
                                ? styles.quickReactionOwn
                                : styles.quickReactionOther
                            }`}
                          >
                            <div className={styles.quickReactionPicker}>
                              {reactionEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  className={styles.reactionButton}
                                  onClick={() =>
                                    handleReactMessage(message.id, emoji)
                                  }
                                >
                                  {emoji}
                                </button>
                              ))}

                              {hasMyReaction && (
                                <button
                                  type="button"
                                  className={styles.removeReactionButton}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() =>
                                    handleReactMessage(message.id, "REMOVE")
                                  }
                                  title="Xóa cảm xúc"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {isMe && (
                        <div className={styles.statusTag}>
                          {message.status === "sending" && (
                            <span>Đang gửi</span>
                          )}
                          {message.status === "error" && (
                            <button
                              type="button"
                              className={styles.retryButton}
                              onClick={() => onRetry?.(message)}
                            >
                              Lỗi · Gửi lại
                            </button>
                          )}
                          {(message.status === "sent" || !message.status) &&
                            isLastSent && <span>Đã gửi</span>}
                          {message.status === "delivered" &&
                            isLastSent && <span style={{ color: "rgba(66, 49, 58, 0.58)" }}>Đã nhận</span>}
                          {message.status === "read" &&
                            isLastSent && <span style={{ color: "#2B87FF", fontWeight: "bold" }}>Đã đọc</span>}
                          {message.status === "recalled" && (
                            <span>Đã thu hồi</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {activeTypingUsers && activeTypingUsers.length > 0 && (
          <div className={styles.typingIndicatorRow}>
            <div className={styles.typingIndicatorBubble}>
              <span className={styles.typingUserText}>
                {activeTypingUsers.join(", ")} {activeTypingUsers.length > 1 ? "đang soạn tin nhắn..." : "đang soạn tin nhắn..."}
              </span>
              <span className={styles.typingDots}>
                <span>•</span><span>•</span><span>•</span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} style={{ height: 1, width: "100%" }} />
      </div>

      {showEmojiPicker && (
        <div ref={emojiPickerRef} className={styles.emojiPickerWrapper}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={300}
            height={400}
            searchPlaceHolder="Tìm kiếm biểu tượng cảm xúc"
            previewConfig={{ showPreview: false }}
            skinTonesDisabled={true}
            emojiStyle="native"
            style={{
              "--epr-category-label-text-color": "#E0407E",
              "--epr-picker-border-color": "#E0407E",
              "--epr-highlight-color": "#E0407E",
              "--epr-focus-bg-color": "#fce4ec",
              borderColor: "#E0407E",
              width: "100%",
            }}
          />
        </div>
      )}

      {showStickerPicker && (
        <div ref={stickerPickerRef} className={styles.stickerPickerWrapper}>
          <StickerPicker
            onSelect={handleStickerSelect}
            onClose={() => setShowStickerPicker(false)}
          />
        </div>
      )}

      <form className={styles.inputArea} onSubmit={submitMessage}>
        {(selectedFile || selectedSticker) && (
          <div className={styles.previewContainer}>
            <div className={styles.previewContent}>
              {selectedFile ? (
                selectedFile.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.previewFileIcon}>
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                    </svg>
                    <span title={selectedFile.name}>{selectedFile.name}</span>
                  </div>
                )
              ) : (
                <img
                  src={selectedSticker.url}
                  alt="Sticker Preview"
                  className={styles.previewImage}
                />
              )}
              <button
                type="button"
                className={styles.removeFileButton}
                onClick={
                  selectedFile
                    ? handleRemoveFile
                    : () => setSelectedSticker(null)
                }
              >
                ×
              </button>
            </div>
            {isUploading && (
              <div className={styles.uploadingOverlay}>
                <div className={styles.spinner} />
              </div>
            )}
          </div>
        )}

        <div className={styles.inputContainer}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSelectFile}
            accept="*"
            style={{ display: "none" }}
          />
          <button
            ref={emojiButtonRef}
            type="button"
            className={`${styles.actionButton} ${showEmojiPicker ? styles.active : ""}`}
            title="Emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <input
            type="text"
            className={styles.input}
            placeholder="Soạn tin nhắn..."
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            disabled={isUploading}
          />
          <button
            type="button"
            className={styles.actionButton}
            title="Đính kèm file"
            onClick={triggerFileSelect}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <button
            ref={stickerButtonRef}
            type="button"
            className={`${styles.actionButton} ${showStickerPicker ? styles.active : ""}`}
            title="Stickers"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15V7a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h8l6-6Z" />
              <path d="M15 21v-3a3 3 0 0 1 3-3h3" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          className={styles.sendButton}
          title="Gửi (Enter)"
          disabled={
            (!inputText.trim() && !selectedFile && !selectedSticker) ||
            isUploading ||
            !isSocketReady
          }
        >
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
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      <RecallConfirmModal
        message={recallTargetMessage}
        isSubmitting={recallingId !== null}
        onClose={closeRecallModal}
        onConfirm={confirmRecallMessage}
      />

      <EditMessageModal
        message={editTargetMessage}
        value={editDraft}
        error={editError}
        isSubmitting={editingId !== null}
        onChange={(value) => {
          setEditDraft(value);
          if (editError) setEditError("");
        }}
        onClose={closeEditModal}
        onConfirm={confirmEditMessage}
      />

            <ChatSummaryModal
                isOpen={summaryOpen}
                onClose={closeSummaryModal}
                type={getSummaryConversationType()}
                target={getSummaryTarget()}
                roomName={isPeopleChat ? `Chat với ${activeChat?.name || ''}` : `Nhóm ${activeChat?.name || ''}`}
                selectedRoom={activeChat}
            />

      <ImageModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default ChatRoomCard;
