import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import HeaderInfo from './HeaderInfo.jsx';
import ListMember from './ListMember.jsx';
import MemberSummary from './MemberSummary.jsx';
import InfoFunction from './InfoFunction.jsx';
import { useChatTheme } from '../../hooks/useChatTheme';
import ThemeSelectorModal from './ThemeSelectorModal.jsx';
import SharedMedia from './SharedMedia.jsx';
import MediaGallery from './MediaGallery';

const ChatInfo = ({ isGroup = false, members = [], onRename, onLeaveRoom, onAddMember }) => {
    const { changeTheme } = useChatTheme();
    const [showThemeSelector, setShowThemeSelector] = useState(false);
    const [viewMode, setViewMode] = useState('MAIN'); // 'MAIN' | 'GALLERY'

    // Lấy tin nhắn từ Redux để xử lý media
    const messages = useSelector(state => state.chat.messages);

    // Tách ảnh/video kèm thời gian từ tin nhắn (Logic từ SharedMedia chuyển sang)
    const mediaList = useMemo(() => {
        const list = [];
        // Lấy tin nhắn mới nhất để hiện ở đầu list
        [...messages].reverse().forEach(msg => {
            if (!msg.mes) return;
            const content = msg.mes;

            // Xử lý Image
            if (content.startsWith('[IMAGE]')) {
                list.push({
                    type: 'image',
                    url: content.replace('[IMAGE]', ''),
                    id: msg.id || msg.tempId,
                    createdAt: msg.createAt || new Date().toISOString(),
                    senderName: msg.name,
                    senderId: msg.name // Dùng Name làm ID 
                });
                // Xử lý Video
            } else if (content.startsWith('[VIDEO]')) {
                list.push({
                    type: 'video',
                    url: content.replace('[VIDEO]', ''),
                    id: msg.id || msg.tempId,
                    createdAt: msg.createAt || new Date().toISOString(),
                    senderName: msg.name,
                    senderId: msg.name // Dùng Name làm ID
                });
            } else if (content.startsWith('[FILE]')) {
                const fileContent = content.replace('[FILE]', '');
                const [url, name, size] = fileContent.split('|');
                list.push({
                    type: 'file',
                    url: url,
                    fileName: name,
                    fileSize: size,
                    id: msg.id || msg.tempId,
                    createdAt: msg.createAt || new Date().toISOString(),
                    senderName: msg.name,
                    senderId: msg.name
                });
            } else {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const matches = content.match(urlRegex);
                if (matches) {
                    matches.forEach(url => {
                        list.push({
                            type: 'link',
                            url: url,
                            fileName: url, // show url thay cho name
                            id: msg.id || msg.tempId,
                            createdAt: msg.createAt || new Date().toISOString(),
                            senderName: msg.name,
                            senderId: msg.name
                        });
                    });
                }
            }
        });
        return list;
    }, [messages]);

    if (viewMode === 'GALLERY') {
        return <MediaGallery
            items={mediaList}
            members={members} // Truyền danh sách thành viên để làm filter
            onClose={() => setViewMode('MAIN')}
        />;
    }

    if (viewMode === 'MEMBERS') {
        return <ListMember
            members={members}
            isGroup={isGroup}
            onAddMember={onAddMember}
            onClose={() => setViewMode('MAIN')}
        />;
    }

    return (
        <div style={{
            width: 320,
            height: '100%',
            backgroundColor: 'transparent',
            borderLeft: '1px solid var(--theme-border, #FFB3D9)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            <HeaderInfo />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <MemberSummary membersOrCount={members} onClick={() => setViewMode('MEMBERS')} />
                {/* Truyền mediaList vào để hiển thị preview */}
                <SharedMedia items={mediaList} onViewAll={() => setViewMode('GALLERY')} />
                <InfoFunction
                    isGroup={isGroup}
                    onRename={onRename}
                    onChangeTheme={() => setShowThemeSelector(true)}
                    onLeaveRoom={onLeaveRoom}
                />
            </div>

            {showThemeSelector && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <ThemeSelectorModal
                        onClose={() => setShowThemeSelector(false)}
                        onSelect={changeTheme}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatInfo;
