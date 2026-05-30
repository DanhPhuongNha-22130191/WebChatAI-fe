import { useEffect, useRef, useState } from "react";

const RenameRoomModal = ({ roomName, onClose, onConfirm, error = "", isSaving = false }) => {
    const [newName, setNewName] = useState(roomName || "");
    const inputRef = useRef(null);

    useEffect(() => {
        setNewName(roomName || "");
    }, [roomName]);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !isSaving) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSaving, onClose]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedName = newName.trim();
        if (!normalizedName || isSaving) return;

        onConfirm(normalizedName);
    };

    return (
        <div
            onClick={isSaving ? undefined : onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                background: "rgba(37, 25, 52, 0.50)",
                backdropFilter: "blur(5px)"
            }}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 430,
                    borderRadius: 24,
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.98)",
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
                            ✎
                        </div>
                        <div>
                            <div style={{ fontSize: 19, fontWeight: 700 }}>Đổi tên phòng chat</div>
                            <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 3 }}>
                                Đặt tên dễ nhớ cho nhóm của bạn
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Đóng"
                        style={{
                            border: 0,
                            background: "rgba(255,255,255,0.17)",
                            color: "white",
                            width: 34,
                            height: 34,
                            borderRadius: 11,
                            cursor: isSaving ? "not-allowed" : "pointer",
                            fontSize: 22,
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: "22px 24px 24px" }}>
                    <label
                        htmlFor="rename-room-input"
                        style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#8c2455",
                            marginBottom: 9
                        }}
                    >
                        Tên phòng chat mới
                    </label>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            border: `1.5px solid ${error ? "#ef476f" : "#f2a5c8"}`,
                            borderRadius: 14,
                            padding: "0 14px",
                            background: error ? "#fff7fa" : "#fff",
                            transition: "border-color .2s"
                        }}
                    >
                        <span style={{ color: "#c72c72", fontSize: 18 }}>#</span>
                        <input
                            id="rename-room-input"
                            ref={inputRef}
                            value={newName}
                            disabled={isSaving}
                            maxLength={80}
                            onChange={(event) => setNewName(event.target.value)}
                            placeholder="Ví dụ: Nhóm Web Chat"
                            style={{
                                flex: 1,
                                border: 0,
                                outline: "none",
                                padding: "14px 0",
                                fontSize: 15,
                                color: "#402331",
                                background: "transparent"
                            }}
                        />
                        <span style={{ fontSize: 12, color: "#9a8490" }}>
                            {newName.trim().length}/80
                        </span>
                    </div>

                    {error && (
                        <div
                            style={{
                                marginTop: 10,
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
                            disabled={isSaving}
                            style={{
                                flex: 1,
                                height: 46,
                                borderRadius: 13,
                                border: "1px solid #eadce4",
                                background: "#f8f4f6",
                                color: "#63535c",
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: isSaving ? "not-allowed" : "pointer"
                            }}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving || !newName.trim()}
                            style={{
                                flex: 1.25,
                                height: 46,
                                borderRadius: 13,
                                border: 0,
                                background: isSaving || !newName.trim()
                                    ? "#e8a6c4"
                                    : "linear-gradient(135deg, #ff4f95 0%, #c72c72 100%)",
                                color: "#fff",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: isSaving || !newName.trim() ? "not-allowed" : "pointer",
                                boxShadow: isSaving || !newName.trim()
                                    ? "none"
                                    : "0 10px 20px rgba(199, 44, 114, 0.24)"
                            }}
                        >
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RenameRoomModal;
