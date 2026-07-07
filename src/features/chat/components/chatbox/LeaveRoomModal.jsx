import { useEffect, useMemo, useState } from "react";
import { getAvatarUrl } from "../../../../shared/utils/avatarUtils";

const ROLE_OWNER = "OWNER";

const getUsername = (member) => {
    if (typeof member === "string") return member;
    return member?.username || member?.user || member?.name || "";
};

const getDisplayName = (member) => {
    if (typeof member === "string") return member;
    return member?.displayName || member?.name || member?.username || "";
};

const LeaveRoomModal = ({
    roomName,
    members = [],
    currentUsername = "",
    currentUserRole = "MEMBER",
    onClose,
    onConfirm,
    error = "",
    isLeaving = false
}) => {
    const remainingMembers = useMemo(() => {
        return members.filter((member) => {
            const username = getUsername(member);
            return username && username !== currentUsername;
        });
    }, [members, currentUsername]);

    const isCurrentOwner =
        String(currentUserRole || "").toUpperCase() === ROLE_OWNER;

    const mustTransferOwner = isCurrentOwner && remainingMembers.length > 0;
    const [selectedOwner, setSelectedOwner] = useState("");

    useEffect(() => {
        if (!mustTransferOwner) {
            setSelectedOwner("");
            return;
        }

        if (!selectedOwner && remainingMembers.length > 0) {
            const deputy = remainingMembers.find(
                (member) => String(member?.role || "").toUpperCase() === "DEPUTY"
            );
            setSelectedOwner(getUsername(deputy || remainingMembers[0]));
        }
    }, [mustTransferOwner, remainingMembers, selectedOwner]);

    const handleConfirm = () => {
        if (mustTransferOwner && !selectedOwner) return;
        onConfirm?.(mustTransferOwner ? selectedOwner : undefined);
    };

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
                    maxWidth: 460,
                    borderRadius: 24,
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "0 26px 70px rgba(80, 21, 64, 0.30)",
                    border: "1px solid rgba(255, 161, 206, 0.7)"
                }}
            >
                <div
                    style={{
                        padding: "22px 24px 18px",
                        background: "linear-gradient(135deg, #ff4f95 0%, #c72c72 100%)",
                        color: "white"
                    }}
                >
                    <div style={{ fontSize: 19, fontWeight: 700 }}>
                        Rời khỏi phòng chat
                    </div>
                    <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 3 }}>
                        {mustTransferOwner
                            ? "Nhường quyền trưởng nhóm trước khi rời"
                            : "Xác nhận trước khi rời nhóm"}
                    </div>
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
                        Bạn có chắc muốn rời khỏi nhóm{" "}
                        <strong style={{ color: "#b51c61" }}>{roomName}</strong>?
                    </div>

                    {mustTransferOwner && (
                        <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#3f2434", marginBottom: 9 }}>
                                Chọn người nhận quyền trưởng nhóm
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                                {remainingMembers.map((member) => {
                                    const username = getUsername(member);
                                    const displayName = getDisplayName(member);
                                    const selected = selectedOwner === username;

                                    return (
                                        <button
                                            key={username}
                                            type="button"
                                            disabled={isLeaving}
                                            onClick={() => setSelectedOwner(username)}
                                            style={{
                                                border: selected ? "1px solid #ff4f95" : "1px solid #eadce4",
                                                background: selected ? "#fff0f7" : "#fff",
                                                borderRadius: 14,
                                                padding: "10px 12px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                cursor: isLeaving ? "not-allowed" : "pointer",
                                                textAlign: "left",
                                                outline: "none"
                                            }}
                                        >
                                            <img
                                                src={getAvatarUrl(displayName || username, 128, member?.avatar)}
                                                alt={displayName || username}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: "50%",
                                                    objectFit: "cover"
                                                }}
                                            />

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#3f2434" }}>
                                                    {displayName || username}
                                                </div>
                                                <div style={{ fontSize: 12, color: "#8a6574" }}>
                                                    @{username}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: "50%",
                                                    border: selected ? "6px solid #ff4f95" : "2px solid #d8c8d0",
                                                    background: "#fff",
                                                    boxSizing: "border-box"
                                                }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: 12, fontSize: 13, color: "#d72655" }}>
                            {error}
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
                            onClick={handleConfirm}
                            disabled={isLeaving || (mustTransferOwner && !selectedOwner)}
                            style={{
                                flex: 1.25,
                                height: 46,
                                borderRadius: 13,
                                border: 0,
                                background:
                                    isLeaving || (mustTransferOwner && !selectedOwner)
                                        ? "#e8a6c4"
                                        : "linear-gradient(135deg, #ff4f95 0%, #c72c72 100%)",
                                color: "#fff",
                                fontSize: 15,
                                fontWeight: 700,
                                cursor:
                                    isLeaving || (mustTransferOwner && !selectedOwner)
                                        ? "not-allowed"
                                        : "pointer"
                            }}
                        >
                            {isLeaving
                                ? "Đang rời..."
                                : mustTransferOwner
                                    ? "Nhường quyền & rời"
                                    : "Rời nhóm"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveRoomModal;