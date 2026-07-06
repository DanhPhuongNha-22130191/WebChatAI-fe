export const CALL_LOG_PREFIX = "[CALL]";

const normalizeCallStatus = (status) => {
  const value = String(status || "").toLowerCase();

  if (["completed", "ended", "success", "done"].includes(value)) return "completed";
  if (["rejected", "declined"].includes(value)) return "rejected";
  if (["canceled", "cancelled"].includes(value)) return "canceled";
  if (["busy"].includes(value)) return "busy";

  return "missed";
};

export const normalizeCallLog = (callLog = {}) => {
  const callType = callLog.callType === "video" || callLog.type === "video" ? "video" : "audio";
  const durationSeconds = Number(callLog.durationSeconds ?? callLog.duration ?? 0);

  return {
    ...callLog,
    callId: callLog.callId || callLog.id || "",
    callType,
    type: callType,
    callStatus: normalizeCallStatus(callLog.callStatus || callLog.status),
    durationSeconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? Math.floor(durationSeconds) : 0,
    caller: callLog.caller || callLog.from || callLog.sender || "",
    receiver: callLog.receiver || callLog.to || "",
    endedBy: callLog.endedBy || "",
    reason: callLog.reason || "",
  };
};

export const serializeCallLog = (callLog) => {
  if (!callLog) return "";

  try {
    return `${CALL_LOG_PREFIX}${JSON.stringify(normalizeCallLog(callLog))}`;
  } catch {
    return CALL_LOG_PREFIX;
  }
};

export const parseCallLog = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value.callLog) {
    return normalizeCallLog(value.callLog);
  }

  if (typeof value === "object" && (value.callType || value.callStatus || value.durationSeconds)) {
    return normalizeCallLog(value);
  }

  const rawText =
    typeof value === "string"
      ? value
      : value.mes || value.content || value.text || "";

  if (typeof rawText !== "string" || !rawText.startsWith(CALL_LOG_PREFIX)) {
    return null;
  }

  const jsonText = rawText.slice(CALL_LOG_PREFIX.length).trim();

  if (!jsonText) {
    return normalizeCallLog({});
  }

  try {
    return normalizeCallLog(JSON.parse(jsonText));
  } catch {
    return normalizeCallLog({});
  }
};

export const formatCallDuration = (seconds = 0) => {
  const safeSeconds = Number.isFinite(Number(seconds)) ? Math.max(0, Math.floor(Number(seconds))) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
};

export const getCallLogTitle = (callLog, currentUsername = "") => {
  const info = normalizeCallLog(callLog);
  const typeText = info.callType === "video" ? "video" : "thoại";
  const isCaller = currentUsername && info.caller === currentUsername;

  if (info.callStatus === "completed") {
    return `Cuộc gọi ${typeText} đã kết thúc`;
  }

  if (info.callStatus === "rejected") {
    return isCaller
      ? `Cuộc gọi ${typeText} bị từ chối`
      : `Bạn đã từ chối cuộc gọi ${typeText}`;
  }

  if (info.callStatus === "busy") {
    return `Người dùng đang bận`;
  }

  if (info.callStatus === "canceled") {
    return isCaller
      ? `Bạn đã hủy cuộc gọi ${typeText}`
      : `Đã nhỡ cuộc gọi ${typeText}`;
  }

  return isCaller
    ? `Không có phản hồi cuộc gọi ${typeText}`
    : `Đã nhỡ cuộc gọi ${typeText}`;
};

export const getCallLogPreview = (callLog, currentUsername = "") => {
  if (!callLog) return "";
  const info = normalizeCallLog(callLog);
  const durationText = info.durationSeconds > 0 ? ` • ${formatCallDuration(info.durationSeconds)}` : "";

  return `${getCallLogTitle(info, currentUsername)}${durationText}`;
};
