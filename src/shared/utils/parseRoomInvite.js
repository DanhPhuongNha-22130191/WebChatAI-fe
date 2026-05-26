// Helper to detect and parse room invitation messages
// Supports JSON payload and string prefix format.
export const parseRoomInvite = (mes) => {
    if (!mes) return null;
    // JSON format: {"type":"ROOM_INVITE","roomName":"xxx","from":"yyy"}
    if (typeof mes === 'string') {
        try {
            const obj = JSON.parse(mes);
            if (obj?.type === 'ROOM_INVITE' && obj.roomName) {
                return { roomName: obj.roomName, from: obj.from };
            }
        } catch (_err) {
            // fall through to prefix parse
        }
    } else if (typeof mes === 'object' && mes.type === 'ROOM_INVITE' && mes.roomName) {
        return { roomName: mes.roomName, from: mes.from };
    }

    // String format: [ROOM_INVITE]|roomName|from
    if (typeof mes === 'string' && mes.startsWith('[ROOM_INVITE]|')) {
        const parts = mes.split('|');
        if (parts.length >= 2) {
            return { roomName: parts[1], from: parts[2] };
        }
    }

    return null;
};

