import React, { useEffect, useMemo, useState } from 'react';
import styles from './ChatRoomCard.module.css';
import { summarizeChat } from '../../api/chatSummaryRepository';

const SUMMARY_LIMIT = 50;

const cleanMarkdown = (text) => {
    if (!text) return '';

    return text
        .replace(/\*\*/g, '')
        .replace(/^#+\s*/g, '')
        .trim();
};

const formatDateTime = (value) => {
    if (!value) return '';

    try {
        const date = new Date(value);

        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return '';
    }
};

const formatSummaryLines = (summaryText) => {
    if (!summaryText) return [];

    return summaryText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
};

const renderFormattedSummary = (summaryText) => {
    const lines = formatSummaryLines(summaryText);

    return lines.map((line, index) => {
        const cleanLine = cleanMarkdown(line.replace(/^\*+\s?/, ''));
        const lowerLine = cleanLine.toLowerCase();

        const isMainTitle =
            lowerLine.includes('tóm tắt cuộc trò chuyện') ||
            lowerLine.includes('tóm tắt trò chuyện');

        const isSectionTitle =
            cleanLine.endsWith(':') ||
            cleanLine.startsWith('Nội dung chính') ||
            cleanLine.startsWith('Việc cần làm') ||
            cleanLine.startsWith('Công việc cần làm') ||
            cleanLine.startsWith('Quyết định') ||
            cleanLine.startsWith('Thống nhất') ||
            cleanLine.startsWith('Ghi chú');

        const isBullet =
            cleanLine.startsWith('- ') ||
            cleanLine.startsWith('• ') ||
            cleanLine.startsWith('+ ') ||
            cleanLine.startsWith('* ');

        if (isMainTitle) {
            return (
                <h4 key={index} className={styles.summaryMainTitle}>
                    {cleanLine}
                </h4>
            );
        }

        if (isSectionTitle) {
            return (
                <div key={index} className={styles.summarySectionTitle}>
                    {cleanLine}
                </div>
            );
        }

        if (isBullet) {
            const bulletText = cleanMarkdown(cleanLine.replace(/^[-•+*]\s*/, ''));

            return (
                <div key={index} className={styles.summaryBullet}>
                    <span className={styles.summaryBulletDot}></span>
                    <span>{bulletText}</span>
                </div>
            );
        }

        return (
            <p key={index} className={styles.summaryParagraph}>
                {cleanLine}
            </p>
        );
    });
};

function ChatSummaryModal({
    isOpen,
    open,
    show,
    visible,

    onClose,
    handleClose,

    type,
    target,
    roomName,
    title,
    chatName,
    selectedRoom
}) {
    const modalOpen = isOpen ?? open ?? show ?? visible ?? false;
    const closeModal = onClose || handleClose || (() => {});

    const conversationType = useMemo(() => {
        if (type === 'room' || type === 'people') return type;

        const rawType = selectedRoom?.type;

        if (rawType === 1 || rawType === '1' || selectedRoom?.badge === 'Group') {
            return 'room';
        }

        return 'people';
    }, [type, selectedRoom]);

    const conversationTarget = useMemo(() => {
        return (
            target ||
            selectedRoom?.name ||
            selectedRoom?.roomName ||
            selectedRoom?.username ||
            selectedRoom?.target ||
            ''
        );
    }, [target, selectedRoom]);

    const displayName =
        roomName ||
        title ||
        chatName ||
        selectedRoom?.name ||
        selectedRoom?.roomName ||
        selectedRoom?.username ||
        conversationTarget ||
        'Cuộc trò chuyện hiện tại';

    const [period, setPeriod] = useState('latest');
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const summaryText = summaryData?.summary || '';
    const messageCount = summaryData?.messageCount || 0;
    const cached = summaryData?.cached;
    const aiProvider = summaryData?.aiProvider;
    const updatedAt = summaryData?.updatedAt || summaryData?.createdAt;

    const periodLabel = {
        latest: `${SUMMARY_LIMIT} tin gần nhất`,
        today: 'Hôm nay'
    };

    const fetchSummary = async (overridePeriod = period) => {
        if (!conversationType || !conversationTarget) {
            setError('Thiếu thông tin cuộc trò chuyện cần tóm tắt.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const data = await summarizeChat({
                type: conversationType,
                target: conversationTarget,
                period: overridePeriod,
                mode: 'general',
                limit: SUMMARY_LIMIT,
                force: false
            });

            setSummaryData(data);
        } catch (err) {
            setSummaryData(null);
            setError(err?.message || 'Không thể tạo tóm tắt.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modalOpen) {
            fetchSummary(period);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalOpen]);

    const handlePeriodChange = (nextPeriod) => {
        setPeriod(nextPeriod);
        setSummaryData(null);
        setError('');
        fetchSummary(nextPeriod);
    };

    const handleUpdateSummary = () => {
        fetchSummary(period);
    };

    if (!modalOpen) return null;

    return (
        <div className={styles.summaryOverlay} onClick={closeModal}>
            <div
                className={styles.summaryModal}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.summaryHeader}>
                    <div className={styles.summaryHeaderLeft}>
                        <div className={styles.summaryIcon}>AI</div>

                        <div className={styles.summaryTitleGroup}>
                            <h2 className={styles.summaryTitle}>Tóm tắt trò chuyện</h2>
                            <p className={styles.summarySubtitle}>{displayName}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.summaryCloseBtn}
                        onClick={closeModal}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.summaryBody}>
                    <div className={styles.summaryFilterPanel}>
                        <div className={styles.summaryFilterBlock}>
                            <label className={styles.summaryFilterLabel}>
                                Phạm vi tóm tắt
                            </label>

                            <div className={styles.summarySegment}>
                                <button
                                    type="button"
                                    className={`${styles.summarySegmentBtn} ${period === 'latest' ? styles.summarySegmentBtnActive : ''}`}
                                    onClick={() => handlePeriodChange('latest')}
                                    disabled={loading}
                                >
                                    {SUMMARY_LIMIT} tin gần nhất
                                </button>

                                <button
                                    type="button"
                                    className={`${styles.summarySegmentBtn} ${period === 'today' ? styles.summarySegmentBtnActive : ''}`}
                                    onClick={() => handlePeriodChange('today')}
                                    disabled={loading}
                                >
                                    Hôm nay
                                </button>
                            </div>
                        </div>

                        <div className={styles.summaryGenerateRow}>
                            <button
                                type="button"
                                className={styles.summaryGenerateBtn}
                                onClick={handleUpdateSummary}
                                disabled={loading}
                            >
                                {loading ? 'Đang tóm tắt...' : 'Cập nhật tóm tắt'}
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className={styles.summaryStateCard}>
                            <div className={styles.summaryLoadingSpinner}></div>

                            <h3 className={styles.summaryStateTitle}>
                                Đang tạo tóm tắt...
                            </h3>

                            <p className={styles.summaryStateText}>
                                AI đang phân tích nội dung cuộc trò chuyện, vui lòng chờ một chút.
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className={styles.summaryStateCardError}>
                            <div className={styles.summaryErrorIcon}>!</div>

                            <h3 className={styles.summaryStateTitle}>
                                Có lỗi xảy ra
                            </h3>

                            <p className={styles.summaryStateText}>
                                {error}
                            </p>

                            <div className={styles.summaryActionRow}>
                                <button
                                    type="button"
                                    className={styles.summaryRetryBtn}
                                    onClick={handleUpdateSummary}
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className={styles.summaryContentWrap}>
                            <div className={styles.summaryMetaRow}>
                                <div className={styles.summaryInfoBadge}>
                                    {periodLabel[period]} • {messageCount} tin nhắn
                                </div>

                                {cached !== undefined && (
                                    <div className={cached ? styles.summaryCacheBadge : styles.summaryNewBadge}>
                                        {cached ? 'Lấy từ database' : 'Tạo mới từ AI'}
                                    </div>
                                )}
                            </div>

                            {updatedAt && (
                                <div className={styles.summarySmallNote}>
                                    Cập nhật: {formatDateTime(updatedAt)}
                                    {aiProvider ? ` • Nguồn: ${aiProvider}` : ''}
                                </div>
                            )}

                            <div className={styles.summaryContentCard}>
                                {summaryText
                                    ? renderFormattedSummary(summaryText)
                                    : (
                                        <p className={styles.summaryParagraph}>
                                            Chưa có nội dung tóm tắt.
                                        </p>
                                    )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.summaryFooter}>
                    <button
                        type="button"
                        className={styles.summaryDoneBtn}
                        onClick={closeModal}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatSummaryModal;