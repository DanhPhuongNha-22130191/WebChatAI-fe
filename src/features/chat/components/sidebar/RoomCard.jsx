import React, { useState } from 'react';
import Card from '../../../../shared/components/Card.jsx';
import { getAvatarUrl, getDisplayName } from '../../../../shared/utils/avatarUtils.js';
import { decodeEmoji } from '../../../../shared/utils/emojiUtils.js';
import styles from './RoomCard.module.css';

const RoomCard = ({
    name,
    type,
    lastMessage,
    active,
    badge,
    displayName,
    avatar,
    bio,
    onClick,
    isOnline,
    onDeleteContact,
    onViewProfile,
    selectedRoomKey,
roomKey,
}) => {
    const [openMenu, setOpenMenu] = useState(false);
    const isPeopleChat = type === 0 || type === 'people';
    const title = getDisplayName({ name, displayName });
   
    React.useEffect(() => {
    setOpenMenu(false);
}, [selectedRoomKey]);

    return (
        <div className={`${styles.roomCardWrapper} ${active ? styles.active : ''}`}>
            {isPeopleChat && (
                <button
                    className={styles.moreButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(prev => !prev);
                    }}
                >
                    ⋮
                </button>
            )}

            {openMenu && (
                <div className={styles.moreMenu} onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => {
                            setOpenMenu(false);
                            onViewProfile?.({ name, username: name, displayName: title, avatar, bio, type });
                        }}
                    >
                        Xem trang cá nhân
                    </button>

                    <button
                        className={styles.deleteMenuItem}
                        onClick={() => {
                            setOpenMenu(false);
                            onDeleteContact?.({ name, type });
                        }}
                    >
                        Xóa liên hệ
                    </button>
                </div>
            )}

            <div className={styles.roomCardInner}>
               <Card
    active={active}
    onClick={(e) => {
        setOpenMenu(false);
        onClick?.(e);
    }}
    className={styles.cardContent}
    style={{
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        paddingLeft: 20,
        paddingRight: isPeopleChat ? 48 : 20,
    }}
>
                    <div className={styles.sparkleContainer}>
                        <img
                            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG52ZjZkeG80N3YyZzhheWo0dXAxYnRpYXc4dzEzamt4aGJ6Znc5YyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/36AnzD7rsNEmdkZ0cr/giphy.gif"
                            alt="sparkle"
                            className={styles.sparkle}
                        />
                    </div>

                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#eee',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={getAvatarUrl(title, 48, avatar)}
                                alt={title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        {isOnline !== undefined && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: isOnline ? '#22c55e' : '#9ca3af',
                                    border: '3px solid #fff',
                                    transform: 'translate(20%, 20%)'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {title}
                            </div>

                            {badge && (
                                <span
                                    style={{
                                        fontSize: 12,
                                        padding: '2px 8px',
                                        borderRadius: 999,
                                        background: '#ffffffaa',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                        </div>

                        <div
                            style={{
                                fontSize: 15,
                                opacity: 0.7,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {decodeEmoji(lastMessage)}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RoomCard;