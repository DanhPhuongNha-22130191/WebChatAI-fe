import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import colors from '../../../../shared/constants/colors';
import MediaGallery from './MediaGallery';
import ImageModal from '../../../../shared/components/ImageModal';
import VideoModal from '../../../../shared/components/VideoModal';

const SharedMedia = ({ items = [], onViewAll }) => { // Nhận items từ ChatInfo
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);

    // Preview: Lấy 8 item mới nhất (image va video)
    const previewItems = useMemo(() => items.slice(0, 8), [items]);

    const handleItemClick = (item) => {
        if (item.type === 'image') {
            setSelectedImage(item.url);
        } else if (item.type === 'video') {
            setPreviewVideo(item.url);
        }
    };

    return (
        <div style={{
            margin: '16px 16px 0 16px',
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s'
        }}
            onMouseEnter={(e) => {
                // e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                // e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primaryText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span style={{ fontWeight: 600, fontSize: 15, color: colors.primaryText }}>Kho lưu trữ</span>
                </div>
            </div>

            {/* Grid Preview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 4,
                marginBottom: 12
            }}>
                {previewItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleItemClick(item)}
                        style={{
                            position: 'relative',
                            paddingTop: '100%',
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            border: '1px solid rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {item.type === 'image' ? (
                            <img
                                src={item.url}
                                alt="thumb"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <video
                                    src={item.url}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    muted
                                />
                                <div style={{ // Icon Play nhỏ
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    fontSize: 10, color: '#fff', textShadow: '0 0 2px black'
                                }}>▶</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Nếu chưa có media */}
            {previewItems.length === 0 && (
                <div style={{ fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 12, textAlign: 'center' }}>Chưa có ảnh/video</div>
            )}

            {/* Button Xem tất cả */}
            {items.length > 0 && (
                <button
                    onClick={onViewAll}
                    style={{
                        width: '100%',
                        padding: '10px 0',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        borderRadius: 12,
                        color: colors.primaryText,
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Xem tất cả
                </button>
            )}
            {/* Image & Video Modal */}
            {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
            {previewVideo && <VideoModal videoUrl={previewVideo} onClose={() => setPreviewVideo(null)} />}
        </div>
    );
};

export default SharedMedia;
