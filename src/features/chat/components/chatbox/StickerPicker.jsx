import React, { useState, useEffect } from 'react';
import { STICKER_COLLECTIONS } from '../../../../shared/utils/stickers';
import colors from '../../../../shared/constants/colors';

const RECENT_STICKERS_KEY = 'app_chat_recent_stickers';

const StickerPicker = ({ onSelect, onClose }) => {
    const [activeTab, setActiveTab] = useState('recent');
    const [searchTerm, setSearchTerm] = useState('');
    const [recentStickers, setRecentStickers] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_STICKERS_KEY);
            if (stored) {
                setRecentStickers(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load recent stickers", error);
        }
    }, []);

    const handleSelectSticker = (stickerObj) => {
        const newRecent = [stickerObj, ...recentStickers.filter(s => s.url !== stickerObj.url)].slice(0, 12);
        setRecentStickers(newRecent);
        localStorage.setItem(RECENT_STICKERS_KEY, JSON.stringify(newRecent));

        onSelect(stickerObj);
    };

    const filteredCollections = STICKER_COLLECTIONS.filter(
        c => c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (activeTab === 'recent') {
            if (recentStickers.length === 0) {
                return (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#999',
                        flexDirection: 'column',
                        gap: 8
                    }}>
                        <span>🕒</span>
                        <span style={{ fontSize: 13 }}>Chưa có sticker gần đây</span>
                    </div>
                );
            }
            return (
                <div style={styles.grid}>
                    {recentStickers.map((sticker, index) => (
                        <div
                            key={`recent-${index}`}
                            style={styles.stickerItem}
                            onClick={() => handleSelectSticker(sticker)}
                        >
                            <img src={sticker.url} alt="sticker" style={styles.stickerImg} />
                        </div>
                    ))}
                </div>
            );
        }

        const collection = STICKER_COLLECTIONS.find(c => c.id === activeTab);
        if (!collection) return null;

        return (
            <div style={styles.grid}>
                {collection.stickers.map((url, index) => (
                    <div
                        key={`${collection.id}-${index}`}
                        style={styles.stickerItem}
                        onClick={() => handleSelectSticker({
                            id: collection.id,
                            index: index,
                            url: url
                        })}
                    >
                        <img src={url} alt="sticker" style={styles.stickerImg} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* Search Bar */}
            <div style={styles.searchContainer}>
                <div style={styles.searchIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
                <input
                    style={styles.searchInput}
                    placeholder="Tìm kiếm nhãn dán..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Main Content Area */}
            <div style={styles.content}>
                {renderContent()}
            </div>

            {/* Bottom Tabs */}
            <div style={styles.tabsScrollContainer}>
                <div
                    style={{
                        ...styles.tabItem,
                        backgroundColor: activeTab === 'recent' ? '#eee' : 'transparent'
                    }}
                    onClick={() => setActiveTab('recent')}
                    title="Gần đây"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>

                {filteredCollections.map(collection => (
                    <div
                        key={collection.id}
                        style={{
                            ...styles.tabItem,
                            backgroundColor: activeTab === collection.id ? '#eee' : 'transparent'
                        }}
                        onClick={() => setActiveTab(collection.id)}
                        title={collection.name}
                    >
                        <img
                            src={collection.icon}
                            alt={collection.name}
                            style={{ width: 24, height: 24, objectFit: 'contain' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: 320,
        height: 350,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    searchContainer: {
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    searchIcon: {
        position: 'absolute',
        left: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center'
    },
    searchInput: {
        width: '100%',
        padding: '8px 8px 8px 32px',
        borderRadius: 20,
        border: '1px solid #ddd',
        backgroundColor: '#f5f5f5',
        fontSize: 14,
        outline: 'none'
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: 12,
        backgroundColor: '#fff',
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '::-webkit-scrollbar': {
            width: '8px'
        },
        '::-webkit-scrollbar-track': {
            background: 'transparent'
        },
        '::-webkit-scrollbar-thumb': {
            background: 'transparent',
            borderRadius: '4px'
        },
        ':hover::-webkit-scrollbar-thumb': {
            background: '#fff',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
        }
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12
    },
    stickerItem: {
        aspectRatio: '1',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s',
        ':hover': {
            transform: 'scale(1.1)'
        }
    },
    stickerImg: {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },
    tabsScrollContainer: {
        display: 'flex',
        overflowX: 'auto',
        padding: '8px 12px',
        borderTop: '1px solid #eee',
        gap: 8,
        backgroundColor: '#fff',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },
    tabItem: {
        width: 36,
        height: 36,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        color: colors.regularText
    }
};

export default StickerPicker;
