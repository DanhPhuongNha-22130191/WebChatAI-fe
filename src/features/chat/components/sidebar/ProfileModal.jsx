import React, { useEffect, useMemo, useState } from 'react';
import { getAvatarUrl, getDisplayName } from '../../../../shared/utils/avatarUtils.js';
import { uploadFile } from '../../../../shared/services/cloudinaryService.js';

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(32, 18, 30, 0.45)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
};

const cardStyle = {
    width: 'min(480px, 100%)',
    borderRadius: 24,
    background: '#fff',
    boxShadow: '0 24px 70px rgba(81, 27, 56, 0.28)',
    overflow: 'hidden'
};

const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #f0c7d8',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 15,
    outline: 'none',
    color: '#4b3942',
    background: '#fffafd'
};

const labelStyle = {
    display: 'block',
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 700,
    color: '#8a4b65'
};

const buttonStyle = {
    border: 'none',
    borderRadius: 14,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 750,
    cursor: 'pointer'
};

const getUsername = (profile) => profile?.username || profile?.user || profile?.name || '';

const ProfileModal = ({ target, currentUser, actions, onClose }) => {
    const currentUsername = getUsername(currentUser) || localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
    const targetUsername = getUsername(target) || currentUsername;
    const isMine = targetUsername === currentUsername;

    const initialProfile = useMemo(() => ({
        username: targetUsername,
        user: targetUsername,
        name: targetUsername,
        displayName: target?.displayName || target?.display_name || target?.name || targetUsername,
        avatar: target?.avatar || '',
        bio: target?.bio || ''
    }), [target, targetUsername]);

    const [profile, setProfile] = useState(initialProfile);
    const [draft, setDraft] = useState(initialProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setProfile(initialProfile);
        setDraft(initialProfile);
    }, [initialProfile]);

    useEffect(() => {
        if (!targetUsername || !actions?.getProfile) {
            setLoading(false);
            return;
        }

        window.__pendingProfileCallbacks = window.__pendingProfileCallbacks || {};
        window.__pendingProfileCallbacks[targetUsername] = {
            onSuccess: (data) => {
                const nextProfile = {
                    ...initialProfile,
                    ...data,
                    username: getUsername(data) || targetUsername,
                    user: getUsername(data) || targetUsername,
                    name: getUsername(data) || targetUsername,
                    displayName: data?.displayName || targetUsername,
                    avatar: data?.avatar || '',
                    bio: data?.bio || ''
                };

                setProfile(nextProfile);
                setDraft(nextProfile);
                setLoading(false);
                setError('');
            },
            onError: (message) => {
                setLoading(false);
                setError(message || 'Không thể tải hồ sơ.');
            }
        };

        actions.getProfile(targetUsername);

        const fallback = setTimeout(() => setLoading(false), 4000);

        return () => {
            clearTimeout(fallback);
            if (window.__pendingProfileCallbacks) {
                delete window.__pendingProfileCallbacks[targetUsername];
            }
        };
    }, [actions, initialProfile, targetUsername]);

    const displayName = getDisplayName(profile);
    const avatarUrl = getAvatarUrl(displayName, 160, profile.avatar);

    const handleChange = (field) => (event) => {
        setDraft((prev) => ({
            ...prev,
            [field]: event.target.value
        }));
        setSuccess('');
        setError('');
    };

    const handleUploadAvatar = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh.');
            return;
        }

        try {
            setUploading(true);
            setError('');
            const result = await uploadFile(file);
            setDraft((prev) => ({ ...prev, avatar: result.url }));
        } catch (err) {
            setError(err.message || 'Upload ảnh đại diện thất bại.');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isMine || saving || uploading) return;

        const nextDisplayName = draft.displayName?.trim();

        if (!nextDisplayName) {
            setError('Tên hiển thị không được để trống.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        window.__pendingProfileUpdate = {
            onSuccess: (data) => {
                const nextProfile = {
                    ...draft,
                    ...data,
                    displayName: data?.displayName || nextDisplayName,
                    avatar: data?.avatar || '',
                    bio: data?.bio || ''
                };

                setProfile(nextProfile);
                setDraft(nextProfile);
                setSaving(false);
                setSuccess('Đã lưu thông tin cá nhân.');
            },
            onError: (message) => {
                setSaving(false);
                setError(message || 'Không thể cập nhật hồ sơ.');
            }
        };

        actions.updateProfile({
            displayName: nextDisplayName,
            avatar: draft.avatar?.trim() || '',
            bio: draft.bio?.trim() || ''
        });
    };

    return (
        <div style={overlayStyle} onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving && !uploading) onClose?.();
        }}>
            <div style={cardStyle} role="dialog" aria-modal="true">
                <div style={{
                    padding: '22px 24px',
                    background: 'linear-gradient(120deg, #ff5a9d 0%, #d52d70 100%)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 22 }}>
                            {isMine ? 'Thông tin cá nhân' : 'Trang cá nhân'}
                        </h2>
                        <p style={{ margin: '5px 0 0', opacity: 0.88, fontSize: 13 }}>
                            @{targetUsername}
                        </p>
                    </div>
                    <button
    type="button"
    onClick={onClose}
    disabled={saving || uploading}
    style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: 'none',
        background: 'rgba(255,255,255,0.2)',
        color: '#fff',
        fontSize: 24,
        fontWeight: 700,
        cursor: saving || uploading ? 'default' : 'pointer',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        lineHeight: 1
    }}
>
    ×
</button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22 }}>
                        <img
                            src={getAvatarUrl(draft.displayName || displayName, 160, draft.avatar || profile.avatar)}
                            alt={draft.displayName || displayName}
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '4px solid #ffe0ec',
                                flexShrink: 0
                            }}
                        />
                        <div style={{ minWidth: 0 }}>
                            <h3 style={{ margin: '0 0 5px', fontSize: 22, color: '#43313a' }}>
                                {draft.displayName || displayName}
                            </h3>
                            <p style={{ margin: 0, color: '#8f737f', fontSize: 14 }}>
                                {loading ? 'Đang tải hồ sơ...' : `@${targetUsername}`}
                            </p>
                            {isMine && (
                                <label style={{
                                    display: 'inline-block',
                                    marginTop: 12,
                                    padding: '9px 13px',
                                    borderRadius: 12,
                                    background: '#fff0f6',
                                    color: '#c53269',
                                    fontWeight: 750,
                                    fontSize: 13,
                                    cursor: uploading ? 'default' : 'pointer'
                                }}>
                                    {uploading ? 'Đang upload...' : 'Chọn ảnh'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadAvatar}
                                        disabled={uploading || saving}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {isMine ? (
                        <>
                            <div style={{ marginBottom: 15 }}>
                                <label style={labelStyle}>Tên hiển thị</label>
                                <input
                                    style={fieldStyle}
                                    value={draft.displayName || ''}
                                    onChange={handleChange('displayName')}
                                    maxLength={100}
                                    placeholder="Nhập tên hiển thị"
                                />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label style={labelStyle}>Link ảnh đại diện</label>
                                <input
                                    style={fieldStyle}
                                    value={draft.avatar || ''}
                                    onChange={handleChange('avatar')}
                                    placeholder="https://..."
                                />
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <label style={labelStyle}>Mô tả bản thân</label>
                                <textarea
                                    style={{ ...fieldStyle, minHeight: 105, resize: 'vertical', lineHeight: 1.5 }}
                                    value={draft.bio || ''}
                                    onChange={handleChange('bio')}
                                    maxLength={500}
                                    placeholder="Viết vài dòng giới thiệu về bạn..."
                                />
                                <div style={{ textAlign: 'right', color: '#a88b98', fontSize: 12, marginTop: 5 }}>
                                    {(draft.bio || '').length}/500
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: 16,
                            borderRadius: 16,
                            background: '#fff7fa',
                            border: '1px solid #f5d0df',
                            color: '#5c4550',
                            lineHeight: 1.55,
                            minHeight: 70
                        }}>
                            {profile.bio || 'Người dùng này chưa thêm mô tả bản thân.'}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            marginTop: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: '#fff1f2',
                            color: '#be123c',
                            fontSize: 13,
                            fontWeight: 650
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            marginTop: 12,
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: '#ecfdf5',
                            color: '#047857',
                            fontSize: 13,
                            fontWeight: 650
                        }}>
                            {success}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 22 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving || uploading}
                            style={{
                                ...buttonStyle,
                                background: '#f8edf2',
                                color: '#6f5360'
                            }}
                        >
                            Đóng
                        </button>
                        {isMine && (
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                style={{
                                    ...buttonStyle,
                                    background: 'linear-gradient(120deg, #ff4f98 0%, #d52d70 100%)',
                                    color: '#fff',
                                    opacity: saving || uploading ? 0.65 : 1
                                }}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
