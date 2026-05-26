
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ImageModal.module.css';

import { downloadMedia, copyToClipboard } from '../utils/mediaUtils';

// Modal de xem anh phong to
const ImageModal = ({ imageUrl, onClose }) => {
    // Đóng modal khi bấm ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleDownload = (e) => {
        e.stopPropagation();
        downloadMedia(imageUrl, 'image', 'jpg');
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        copyToClipboard(imageUrl, 'Đã sao chép liên kết ảnh!');
    };

    if (!imageUrl) return null;

    const actionButtonStyle = {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        color: 'white',
        width: 48,
        height: 48,
        padding: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backdropFilter: 'blur(4px)',
        zIndex: 100000
    };

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            {/* Toolbar */}
            <div style={{
                position: 'fixed',
                top: 20,
                right: 20,
                display: 'flex',
                gap: 12,
                zIndex: 100000
            }} onClick={(e) => e.stopPropagation()}>

                <button
                    style={actionButtonStyle}
                    onClick={handleDownload}
                    title="Tải về"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>

                <button
                    style={actionButtonStyle}
                    onClick={handleCopyLink}
                    title="Sao chép liên kết"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                </button>

                <button
                    style={actionButtonStyle}
                    onClick={onClose}
                    title="Đóng (ESC)"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Zoomed" className={styles.image} />
            </div>
        </div>,
        document.body
    );
};

export default ImageModal;
