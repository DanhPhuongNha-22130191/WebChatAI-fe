import React, { useState, useMemo, useRef, useEffect } from 'react';
import colors from '../../../../shared/constants/colors';
import ImageModal from '../../../../shared/components/ImageModal';
import VideoModal from '../../../../shared/components/VideoModal';

// Formats date group header 
const formatDateGroup = (isoString) => {
    if (!isoString) return 'Khác';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Khác';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `Ngày ${day} Tháng ${month}`;
};

// Helper size
const filterSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


const SenderFilter = ({ members, onSelect, selectedSenderId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredMembers = useMemo(() => {
        return members.filter(m =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);

    const selectedName = useMemo(() => {
        if (!selectedSenderId) return 'Người gửi';
        const found = members.find(m => m.id === selectedSenderId);
        return found ? found.name : 'Người gửi';
    }, [selectedSenderId, members]);

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    backgroundColor: selectedSenderId ? '#FFE5F1' : 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 16, padding: '6px 12px', fontSize: 13,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', color: selectedSenderId ? colors.primaryText : '#333',
                    border: selectedSenderId ? `1px solid ${colors.primaryButton}` : '1px solid #fff',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedName}</span>
                <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '120%', left: 0, width: 220, zIndex: 10,
                    backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: 8, border: '1px solid #eee'
                }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 12px', borderRadius: 20, border: '1px solid #ddd',
                            backgroundColor: '#f5f5f5', outline: 'none', fontSize: 13, marginBottom: 8,
                            boxSizing: 'border-box'
                        }}
                    />
                    <div className="no-scrollbar" style={{ maxHeight: 200, overflowY: 'auto' }}>
                        <div
                            onClick={() => { onSelect(null); setIsOpen(false); }}
                            style={{ padding: '8px', cursor: 'pointer', borderRadius: 4, fontSize: 13, color: '#333' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            Tất cả
                        </div>
                        {filteredMembers.map(member => (
                            <div
                                key={member.id}
                                onClick={() => { onSelect(member.id); setIsOpen(false); }}
                                style={{
                                    padding: '8px', cursor: 'pointer', borderRadius: 4, fontSize: 13,
                                    display: 'flex', alignItems: 'center', gap: 8
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <img
                                    src={member.avatar || "https://via.placeholder.com/30"}
                                    alt="avatar"
                                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const DateFilter = ({ onSelectRange, activeRange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleApplyRange = () => {
        if (fromDate && toDate) {
            onSelectRange({ type: 'custom', from: new Date(fromDate), to: new Date(toDate), label: 'Tùy chọn' });
            setIsOpen(false);
        }
    };

    const handlePreset = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        onSelectRange({ type: 'preset', from: start, to: end, label: `${days} ngày trước` });
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    backgroundColor: activeRange ? '#FFE5F1' : 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 16, padding: '6px 12px', fontSize: 13,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', color: activeRange ? colors.primaryText : '#333',
                    border: activeRange ? `1px solid ${colors.primaryButton}` : '1px solid #fff',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeRange ? activeRange.label : 'Ngày gửi'}
                </span>
                <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '120%', right: 0, width: 280, zIndex: 10,
                    backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: 0, border: '1px solid #eee', overflow: 'hidden'
                }}>
                    <div style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                        <div style={presetStyle} onClick={() => handlePreset(7)}>7 ngày trước</div>
                        <div style={presetStyle} onClick={() => handlePreset(30)}>30 ngày trước</div>
                        <div style={presetStyle} onClick={() => handlePreset(90)}>3 tháng trước</div>
                        <div style={presetStyle} onClick={() => { onSelectRange(null); setIsOpen(false); }}>Tất cả thời gian</div>
                    </div>

                    <div style={{ padding: 12, backgroundColor: '#f9f9f9' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#666' }}>Chọn khoảng thời gian</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={dateInputStyle}
                            />
                            <span style={{ alignSelf: 'center' }}>-</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={dateInputStyle}
                            />
                        </div>
                        <button
                            onClick={handleApplyRange}
                            style={{
                                width: '100%', padding: '6px', backgroundColor: colors.primaryButton,
                                color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13
                            }}
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const presetStyle = {
    padding: '8px', cursor: 'pointer', borderRadius: 4, fontSize: 13, color: '#333',
    transition: 'background-color 0.1s'
};
const dateInputStyle = {
    flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', fontSize: 12
};


// --- Main Component ---

const MediaGallery = ({ items = [], members = [], initialTab = 'media', onClose }) => {
    const [activeTab, setActiveTab] = useState(initialTab); // 'media' (anh+video), 'file', 'link'
    const [selectedImage, setSelectedImage] = useState(null);

    // Filter States
    const [selectedSenderId, setSelectedSenderId] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null); // State cho video modal

    // Filter Items
    const filteredItems = useMemo(() => {
        let result = items;

        // 1. Filter by Tab Type
        if (activeTab === 'media') {
            result = result.filter(item => item.type === 'image' || item.type === 'video');
        } else {
            result = result.filter(item => item.type === activeTab);
        }

        // 2. Filter by Sender
        if (selectedSenderId) {
            result = result.filter(item => item.senderId === selectedSenderId); // requires senderId logic
        }

        // 3. Filter by Date Range
        if (dateRange) {
            result = result.filter(item => {
                const itemDate = new Date(item.createdAt);
                const from = new Date(dateRange.from); from.setHours(0, 0, 0, 0);
                const to = new Date(dateRange.to); to.setHours(23, 59, 59, 999);
                return itemDate >= from && itemDate <= to;
            });
        }

        return result;
    }, [items, activeTab, selectedSenderId, dateRange]);

    // Group items by Date
    const groupedItems = useMemo(() => {
        const groups = {};
        filteredItems.forEach(item => {
            const dateKey = formatDateGroup(item.createdAt);
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    }, [filteredItems]);

    const handleItemClick = (item) => {
        if (item.type === 'image') {
            setSelectedImage(item.url);
        } else if (item.type === 'video') {
            // Mở video trong app thay vì tab mới
            setPreviewVideo(item.url);
        }
    };

    const renderTabs = () => (
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', backgroundColor: 'transparent', flexDirection: 'column' }}>
            {/* Main Tabs */}
            <div style={{ display: 'flex' }}>
                {['media', 'file', 'link'].map(tab => {
                    const isActive = activeTab === tab;
                    const labels = { media: 'Ảnh/Video', file: 'Files', link: 'Links' };
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '12px 0',
                                background: 'none',
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                                borderBottom: isActive ? `3px solid ${colors.primaryButton}` : '3px solid transparent',
                                color: isActive ? colors.primaryButton : colors.regularText,
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                fontSize: 14,
                                transition: 'all 0.2s',
                                borderRadius: '4px 4px 0 0'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {labels[tab]}
                        </button>
                    );
                })}
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', padding: '8px 12px', gap: 8, alignItems: 'center' }}>
                <SenderFilter
                    members={members}
                    selectedSenderId={selectedSenderId}
                    onSelect={setSelectedSenderId}
                />
                <DateFilter
                    activeRange={dateRange}
                    onSelectRange={setDateRange}
                />
            </div>

            {/* Render Video Modal */}
            {previewVideo && (
                <VideoModal
                    videoUrl={previewVideo}
                    onClose={() => setPreviewVideo(null)}
                />
            )}
        </div>
    );

    const renderContent = () => {
        if (filteredItems.length === 0) {
            return (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    <div>Chưa có {activeTab === 'file' ? 'file' : activeTab === 'link' ? 'link' : 'ảnh/video'} nào</div>
                </div>
            );
        }

        return (
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
                {Object.entries(groupedItems).map(([date, groupItems]) => (
                    <div key={date} style={{ marginBottom: 20 }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#444', fontWeight: 600 }}>{date}</h4>

                        {activeTab === 'file' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {groupItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={
                                            (item.url.includes('/upload/') && !item.url.includes('/raw/') && !item.url.toLowerCase().endsWith('.pdf'))
                                                ? item.url.replace('/upload/', '/upload/fl_attachment/')
                                                : item.url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 10,
                                            borderRadius: 8,
                                            backgroundColor: '#fff',
                                            border: '1px solid #eee',
                                            gap: 12,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                        >
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 6,
                                                backgroundColor: '#FFF0F6', color: colors.primaryButton,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.fileName || 'Unknown File'}</div>
                                                <div style={{ fontSize: 11, color: '#888' }}>{filterSize(item.fileSize)}</div>
                                            </div>
                                            <div style={{ color: '#ccc' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : activeTab === 'link' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {groupItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 10,
                                            borderRadius: 8,
                                            backgroundColor: '#fff',
                                            border: '1px solid #eee',
                                            gap: 12,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                        >
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 6,
                                                backgroundColor: '#E6F7FF', color: '#1890FF',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1890FF' }}>{item.url}</div>
                                                <div style={{ fontSize: 11, color: '#888' }}>Link</div>
                                            </div>
                                            <div style={{ color: '#ccc' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 6
                            }}>
                                {groupItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleItemClick(item)}
                                        style={{
                                            position: 'relative',
                                            paddingTop: '100%',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            backgroundColor: '#f5f5f5',
                                            border: '1px solid #eee'
                                        }}
                                    >
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt="media" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                                                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} muted />
                                                <span style={{ position: 'absolute', color: '#fff', fontSize: 16 }}>▶</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{
            height: '100%',
            backgroundColor: 'transparent',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
                backgroundColor: 'transparent',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 10,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#333',
                            display: 'flex', alignItems: 'center', padding: 4, borderRadius: '50%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <span style={{ fontSize: 17, fontWeight: 700, color: colors.primaryText }}>Kho lưu trữ</span>
                </div>

                <button style={{
                    background: 'none', border: 'none', fontSize: 14, fontWeight: 600,
                    color: colors.primaryButton, cursor: 'pointer', padding: '8px 12px',
                    borderRadius: 4
                }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF0F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    Chọn
                </button>
            </div>

            {/* Tabs & Filters */}
            {renderTabs()}

            {/* Content */}
            {renderContent()}

            {/* Image Modal */}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
    );
};

export default MediaGallery;
