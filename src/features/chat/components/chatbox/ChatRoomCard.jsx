import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../../state/chat/chatSlice';
import EmojiPicker from 'emoji-picker-react';
import styles from './ChatRoomCard.module.css';
import Loading from '../../../../shared/components/Loading';
import ImageModal from '../../../../shared/components/ImageModal';
import { useSocket } from '../../../../app/providers/useSocket.js';
import { parseRoomInvite } from '../../../../shared/utils/parseRoomInvite.js';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';
import { decodeEmoji } from '../../../../shared/utils/emojiUtils.js';
import { createStickerCode, getStickerUrl, isStickerMessage } from '../../../../shared/utils/stickerUtils';
import StickerPicker from './StickerPicker';

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
    // File Props
    selectedFile,
    isUploading,
    handleSelectFile,
    handleRemoveFile,
    onRetry, // Nhan onRetry prop
    isSocketReady
}) => {
    const dispatch = useDispatch();
    const { actions: socketActions } = useSocket();
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedSticker, setSelectedSticker] = useState(null);

    const handleJoinRoom = useCallback((roomName) => {
        if (!roomName || !socketActions) return;
        const senderName = myUsername || localStorage.getItem('user_name') || 'Ai đó';
        socketActions.joinRoom(roomName);
        // Gửi một tin nhắn vào phòng để giữ lịch sử phòng, kèm tên người tham gia
        setTimeout(() => {
            socketActions.sendChat(roomName, `${senderName} đã tham gia nhóm`, 'room');
            socketActions.roomHistory(roomName, 1);
        }, 400);
    }, [socketActions, myUsername]);

    // Hàm helper để parse thời gian
    const parseTime = (timeStr) => {
        if (!timeStr) return new Date();
        return new Date(timeStr);
    };

    // Logic gộp timestamp
    const shouldShowTimestamp = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        if (!currentMsg.createAt || !prevMsg.createAt) return true;

        const currentTime = parseTime(currentMsg.createAt);
        const prevTime = parseTime(prevMsg.createAt);

        if (isNaN(currentTime.getTime()) || isNaN(prevTime.getTime())) return true;

        const diffMinutes = (currentTime - prevTime) / 1000 / 60;
        return diffMinutes > 30;
    };

    const formatTimeFull = (timeStr) => {
        const date = parseTime(timeStr);
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTimeShort = (timeStr) => {
        if (!timeStr) return '';
        const date = parseTime(timeStr);
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const isSameMinute = (d1Str, d2Str) => {
        if (!d1Str || !d2Str) return false;
        const d1 = parseTime(d1Str);
        const d2 = parseTime(d2Str);
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate() &&
            d1.getHours() === d2.getHours() &&
            d1.getMinutes() === d2.getMinutes();
    };

    // Helper: Trigger chọn file
    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Helper: Render nội dung tin nhắn (Text / Image / Video)
    const renderMessageContent = (mes) => {
        // 1. Kiểm tra mã Sticker [STICKER]:packId:index
        if (isStickerMessage(mes)) {
            const stickerUrl = getStickerUrl(mes);
            if (stickerUrl) {
                return (
                    <img
                        src={stickerUrl}
                        alt="sticker"
                        className={styles.stickerImage}
                        onClick={() => setPreviewImage(stickerUrl)}
                    />
                );
            }
            return <span>[Sticker lỗi]</span>;
        }

        // 2. Kiểm tra ảnh thông thường [IMAGE]url
        if (mes.startsWith('[IMAGE]')) {
            const url = mes.replace('[IMAGE]', '');
            // Hiển thị ảnh tải lên kích thước bình thường
            return (
                <img
                    src={url}
                    alt="Sent image"
                    style={{ maxWidth: '250px', maxHeight: '300px', borderRadius: '12px', cursor: 'pointer', objectFit: 'cover' }}
                    onClick={() => setPreviewImage(url)}
                />
            );
        }

        // 3. Kiểm tra Video
        if (mes.startsWith('[VIDEO]')) {
            const url = mes.replace('[VIDEO]', '');
            return (
                <video
                    src={url}
                    controls
                    style={{ maxWidth: '250px', maxHeight: '300px', borderRadius: '12px' }}
                />
            );
        }
        if (mes.startsWith('[FILE]')) {
            const content = mes.replace('[FILE]', '');
            const [url, name, size] = content.split('|');

            // Format size
            const formatSize = (bytes) => {
                if (!bytes) return 'Unknown size';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };

            const getDownloadUrl = (originalUrl) => {
                if (!originalUrl) return '';
                // PDF -> Open in new tab 
                if (originalUrl.toLowerCase().endsWith('.pdf')) {
                    return originalUrl;
                }
                if (originalUrl.includes('cloudinary.com') && originalUrl.includes('/upload/') && !originalUrl.includes('/raw/')) {
                    return originalUrl.replace('/upload/', '/upload/fl_attachment/');
                }
                return originalUrl;
            };

            return (
                <a href={getDownloadUrl(url)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 12,
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        minWidth: 200,
                        maxWidth: 300,
                        color: '#333'
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 8,
                            backgroundColor: '#FFF0F6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#E0407E'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>{name || 'Unknown File'}</span>
                            <span style={{ fontSize: 11, opacity: 0.7 }}>{formatSize(size)}</span>
                        </div>
                        <div style={{ color: '#666' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </div>
                    </div>
                </a>
            );
        }
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = mes.split(urlRegex);

        return (
            <span>
                {parts.map((part, index) => {
                    if (part.match(urlRegex)) {
                        return (
                            <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {part}
                            </a>
                        );
                    }
                    return <span key={index}>{decodeEmoji(part)}</span>;
                })}
            </span>
        );
    };

    // State cho Emoji Picker
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const emojiButtonRef = useRef(null);

    // State cho Sticker Picker
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const stickerPickerRef = useRef(null);
    const stickerButtonRef = useRef(null);

    const onEmojiClick = (emojiObject) => {
        setInputText((prev) => prev + emojiObject.emoji);
    };

    const handleStickerSelect = (stickerObj) => {
        if (!activeChat) return;
        // stickerObj = { id, index, url }
        setSelectedSticker(stickerObj); // Lưu lại để xem trước
        setShowStickerPicker(false);
    };

    const handleRemoveSticker = () => {
        setSelectedSticker(null);
    };

    const isEmojiOnly = (str) => {
        if (!str) return false;
        const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u;
        return emojiRegex.test(str);
    };

    useEffect(() => {
        if (!showEmojiPicker && !showStickerPicker) return;

        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
            if (
                stickerPickerRef.current &&
                !stickerPickerRef.current.contains(event.target) &&
                stickerButtonRef.current &&
                !stickerButtonRef.current.contains(event.target)
            ) {
                setShowStickerPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, showStickerPicker]);

    if (!activeChat) return null;

    return (
        <div className={styles.container}>
            {/* Overlay nạp dữ liệu */}
            {isLoading && page === 1 && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        <Loading text="Đang tải tin nhắn..." />
                    </div>
                </div>
            )}

            {/* Header phòng chat */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={getAvatarUrl(activeChat.name, 128)}
                            alt={activeChat.name}
                            className={styles.avatar}
                        />
                        {(activeChat.type === 0 || activeChat.type === 'people') && (
                            <div className={isOnline ? styles.onlineDot : styles.offlineDot} />
                        )}
                    </div>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.title}>
                            {((activeChat.type === 0 || activeChat.type === 'people') && activeChat.name === myUsername)
                                ? "Lưu trữ"
                                : activeChat.name}
                        </h3>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <button className={styles.iconButton} title="Gọi">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                    </button>
                    <button className={styles.iconButton} onClick={onInfoClick} title="Thông tin">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="19" cy="12" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Vùng hiển thị tin nhắn */}
            <div
                className={styles.messagesArea}
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                {isLoading && page > 1 && (
                    <div style={{ padding: '10px', textAlign: 'center' }}>
                        <Loading text="Đang tải thêm tin nhắn..." />
                    </div>
                )}

                {messages.length === 0 && !isLoading && (
                    <div className={styles.loader} style={{ padding: '40px 0' }}>
                        Chưa có tin nhắn trong cuộc hội thoại này.
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.name === myUsername;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const showTime = shouldShowTimestamp(msg, prevMsg);
                    const invite = parseRoomInvite(msg.mes);
                    const isLastSent = isMe && (msg.status === 'sent' || !msg.status) && !messages.slice(index + 1).some(m => m.name === myUsername && (m.status === 'sent' || !m.status));
                    const nextMsg = messages[index + 1];
                    const isLastInMinute = !nextMsg || nextMsg.name !== msg.name || !isSameMinute(msg.createAt, nextMsg.createAt);

                    return (
                        <div key={msg.id || msg.tempId || index} className={styles.messageRow}>
                            {showTime && (
                                <div className={styles.centerTimestamp}>
                                    {formatTimeFull(msg.createAt)}
                                </div>
                            )}

                            <div className={styles.messageContent} style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                                {!isMe && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 64 }}>
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={getAvatarUrl(msg.name, 32)}
                                                alt={msg.name}
                                                className={styles.smallAvatar}
                                            />
                                        </div>
                                        <span className={styles.senderName} style={{ margin: '2px 0 0 0', textAlign: 'center', width: '100%', fontSize: 10 }}>{msg.name}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                    {invite ? (
                                        <div className={styles.bubble} style={{
                                            backgroundColor: '#fff8f0',
                                            color: '#333',
                                            border: '1px solid #ffd1a6',
                                            maxWidth: 360
                                        }}>
                                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Lời mời tham gia nhóm</div>
                                            <div style={{ marginBottom: 8 }}>
                                                {invite.from ? `${invite.from} mời bạn tham gia nhóm` : 'Bạn được mời tham gia nhóm'} <b>{invite.roomName}</b>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleJoinRoom(invite.roomName)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: 10,
                                                    border: 'none',
                                                    backgroundColor: '#ff6ca2',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Tham gia nhóm
                                            </button>
                                        </div>
                                    ) : (<>
                                        <div className={`${styles.bubble} ${isEmojiOnly(msg.mes) ? styles.emojiOnly : ''}`} style={{
                                            backgroundColor: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]') || msg.mes.startsWith('[FILE]') || isStickerMessage(msg.mes) || isEmojiOnly(msg.mes)) ? 'transparent' : (isMe ? 'var(--theme-sender-bubble, #FF5596)' : '#fff'),
                                            color: isMe ? 'var(--theme-text-on-primary, #fff)' : '#000',
                                            padding: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]') || msg.mes.startsWith('[FILE]') || isStickerMessage(msg.mes) || isEmojiOnly(msg.mes)) ? '0' : undefined,
                                            boxShadow: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]') || msg.mes.startsWith('[FILE]') || isStickerMessage(msg.mes) || isEmojiOnly(msg.mes)) ? 'none' : undefined,
                                            border: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]') || msg.mes.startsWith('[FILE]') || isStickerMessage(msg.mes) || isEmojiOnly(msg.mes)) ? 'none' : undefined,
                                            maxWidth: (msg.mes.startsWith('[FILE]')) ? '100%' : undefined,
                                            position: 'relative',
                                            fontSize: isEmojiOnly(msg.mes) ? '40px' : undefined
                                        }}>
                                            {renderMessageContent(msg.mes)}

                                            {isLastInMinute && (
                                                <div style={{
                                                    fontSize: '10px',
                                                    marginTop: '4px',
                                                    textAlign: 'left',
                                                    color: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]')) ? '#fff' : (isMe ? 'rgba(255,255,255,0.7)' : '#aaa'),
                                                    textShadow: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]')) ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                                                    backgroundColor: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]')) ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                                                    padding: (msg.mes.startsWith('[IMAGE]') || msg.mes.startsWith('[VIDEO]')) ? '2px 6px' : '0',
                                                    borderRadius: '10px',
                                                    width: 'fit-content'
                                                }}>
                                                    {formatTimeShort(msg.createAt)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Tag (Below Bubble) */}
                                        {isMe && (
                                            <div className={styles.statusTag} style={{ fontSize: '10px' }}>
                                                {msg.status === 'sending' && (
                                                    <>
                                                        <svg className={styles.sendingIcon} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                        </svg>
                                                        <span>Đang gửi</span>
                                                    </>
                                                )}
                                                {msg.status === 'error' && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} onClick={() => onRetry && onRetry(msg)} title="Gửi lại">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                                        </svg>
                                                        <span style={{ color: '#FF4D4F', marginRight: 2 }}>Lỗi</span>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M23 4v6h-6"></path>
                                                            <path d="M1 20v-6h6"></path>
                                                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                                        </svg>
                                                    </div>
                                                )}
                                                {(msg.status === 'sent' || !msg.status) && isLastSent && (
                                                    <>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                        <span>Đã gửi</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} style={{ height: 1, width: '100%' }} />
            </div>

            {
                showEmojiPicker && (
                    <div
                        ref={emojiPickerRef}
                        className={styles.emojiPickerWrapper}
                    >
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            width={300}
                            height={400}
                            searchPlaceHolder="Tìm kiếm biểu tượng cảm xúc"
                            previewConfig={{ showPreview: false }}
                            skinTonesDisabled={true}
                            emojiStyle="native"
                            style={{
                                '--epr-category-label-text-color': '#E0407E',
                                '--epr-picker-border-color': '#E0407E',
                                '--epr-highlight-color': '#E0407E',
                                '--epr-focus-bg-color': '#fce4ec',
                                borderColor: '#E0407E',
                                width: '100%'
                            }}
                        />
                    </div>
                )
            }

            {/* Sticker Picker */}
            {
                showStickerPicker && (
                    <div ref={stickerPickerRef} className={styles.stickerPickerWrapper}>
                        <StickerPicker
                            onSelect={handleStickerSelect}
                            onClose={() => setShowStickerPicker(false)}
                        />
                    </div>
                )
            }

            {/* Form nhập tin nhắn */}
            <form className={styles.inputArea} onSubmit={(e) => {
                e.preventDefault();
                if (selectedSticker) {
                    if (!activeChat || !socketActions) return;
                    const type = (activeChat.type === 0 || activeChat.type === 'people') ? 'people' : 'room';
                    const shortCode = createStickerCode(selectedSticker.id, selectedSticker.index);

                    // Optimistic UI
                    const optimisticMessage = {
                        name: myUsername || localStorage.getItem('user_name') || 'Tôi',
                        mes: shortCode,
                        createAt: new Date().toISOString(),
                        to: activeChat.name,
                        type: type === 'people' ? 'people' : 'room',
                        tempId: Date.now().toString()
                    };
                    dispatch(addMessage(optimisticMessage));

                    socketActions.sendChat(activeChat.name, shortCode, type);
                    setSelectedSticker(null);

                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    handleSend(e);
                }
            }}>
                {/* Xem trước Sticker / Ảnh */}
                {(selectedFile || selectedSticker) && (
                    <div className={styles.previewContainer}>
                        <div className={styles.previewContent}>
                            {selectedFile ? (
                                selectedFile.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className={styles.previewImage} />
                                ) : (
                                    <div className={styles.previewFileIcon}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        <span style={{ fontSize: '10px', marginTop: '4px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }} title={selectedFile.name}>{selectedFile.name}</span>
                                    </div>
                                )
                            ) : (
                                <img src={selectedSticker.url} alt="Sticker Preview" className={styles.previewImage} style={{ objectFit: 'contain', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} />
                            )}
                            <button type="button" className={styles.removeFileButton} onClick={selectedFile ? handleRemoveFile : handleRemoveSticker}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        {isUploading && (
                            <div className={styles.uploadingOverlay}>
                                <div className={styles.spinner}></div>
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
                        style={{ display: 'none' }}
                    />
                    <button
                        ref={emojiButtonRef}
                        type="button"
                        className={`${styles.actionButton} ${showEmojiPicker ? styles.active : ''}`}
                        title="Emoji"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isUploading}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {/* Generic File - Paperclip */}
                        <button type="button" className={styles.actionButton} title="Đính kèm file" onClick={triggerFileSelect}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 7h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h6" />
                                <path d="M13 3.6a2.1 2.1 0 1 1 4 4L7.5 17.1a3.3 3.3 0 1 1-6-6l9.5-9.5" />
                            </svg>
                        </button>
                        {/* Image icon - Click trigger select file */}
                        <button type="button" className={styles.actionButton} title="Đính kèm ảnh/video" onClick={triggerFileSelect}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </button>
                        {/* Sticker icon */}
                        <button
                            ref={stickerButtonRef}
                            type="button"
                            className={`${styles.actionButton} ${showStickerPicker ? styles.active : ''}`}
                            title="Stickers"
                            onClick={() => setShowStickerPicker(!showStickerPicker)}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142L16.4142 20.4142C16.0391 20.7893 15.5304 21 15 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 15H18C16.3431 15 15 16.3431 15 18V21L21 15Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
                                <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
                                <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor" />
                                <path d="M8 15.5C9.5 17.5 14 17.5 15.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className={styles.sendButton}
                    title="Gửi (Enter)"
                    disabled={(!inputText.trim() && !selectedFile && !selectedSticker) || isUploading || !isSocketReady}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </form>

            {/* Modal xem ảnh */}
            <ImageModal
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div >
    );
};

export default ChatRoomCard;