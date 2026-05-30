import { useEffect } from "react";

const LeaveRoomModal = ({ roomName, onClose, onConfirm, error = "", isLeaving = false }) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !isLeaving) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isLeaving, onClose]);

    return (
        <div
            onClick={isLeaving ? undefined : onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                background: "rgba(37, 25, 52, 0.52)",
                backdropFilter: "blur(5px)"
            }}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 430,
                    borderRadius: 24,
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.99)",
                    boxShadow: "0 26px 70px rgba(80, 21, 64, 0.30)",
                    border: "1px solid rgba(255, 161, 206, 0.7)"
                }}
            >
                <div
                    style={{
                        padding: "22px 24px 18px",
                        background: "linear-gradient(135deg, #ff4f95 0%, #c72c72 100%)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                background: "rgba(255, 255, 255, 0.19)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 21
                            }}
                        >
                            ↗
                        </div>
                        <div>
                            <div style={{ fontSize: 19, fontWeight: 700 }}>Rời khỏi phòng chat</div>
                            <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 3 }}>
                                Xác nhận trước khi rời nhóm
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLeaving}
                        aria-label="Đóng"
                        style={{
                            border: 0,
                            background: "rgba(255,255,255,0.17)",
                            color: "white",
                            width: 34,
                            height: 34,
                            borderRadius: 11,
                            cursor: isLeaving ? "not-allowed" : "pointer",
                            fontSize: 22,
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: "22px 24px 24px" }}>
                    <div
                        style={{
                            borderRadius: 16,
                            padding: "15px 16px",
                            background: "#fff5f9",
                            border: "1px solid #ffd0e2",
                            color: "#55313f",
                            fontSize: 14,
                            lineHeight: 1.55
                        }}
                    >
                        Bạn có chắc muốn rời khỏi nhóm <strong style={{ color: "#b51c61" }}>{roomName}</strong>?
                        <div style={{ marginTop: 6, color: "#8a6574", fontSize: 13 }}>
                            Sau khi rời, nhóm sẽ không còn hiển thị trong danh sách chat của bạn.
                        </div>
                    </div>

                    {error && (
                        <div
                            style={{
                                marginTop: 12,
                                fontSize: 13,
                                color: "#d72655",
                                display: "flex",
                                alignItems: "center",
                                gap: 6
                            }}
                        >
                            <span>●</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 12, marginTop: 23 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLeaving}
                            style={{
                                flex: 1,
                                height: 46,
                                borderRadius: 13,
                                border: "1px solid #eadce4",
                                background: "#f8f4f6",
                                color: "#63535c",
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: isLeaving ? "not-allowed" : "pointer"
                            }}
                        >
                            Ở lại
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLeaving}
                            style={{
                                flex: 1.25,
                                height: 46,
                                borderRadius: 13,
                                border: 0,
                                background: isLeaving
                                    ? "#e8a6c4"
                                    : "linear-gradient(135deg, #ff4f95 0%, #c72c72 100%)",
                                color: "#fff",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: isLeaving ? "not-allowed" : "pointer",
                                boxShadow: isLeaving ? "none" : "0 10px 20px rgba(199, 44, 114, 0.24)"
                            }}
                        >
                            {isLeaving ? "Đang rời..." : "Rời nhóm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRoomModal;
