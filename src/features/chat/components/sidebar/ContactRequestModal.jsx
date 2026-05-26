import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ContactRequestHeader from './ContactRequestHeader';
import Button from '../../../../shared/components/Button';
import colors from '../../../../shared/constants/colors';
import { getAvatarUrl } from '../../../../shared/utils/avatarUtils.js';

const ContactRequestModal = ({ recipientName, onClose, onSend }) => {
    const currentUser = useSelector((s) => s.auth.user);
    
    // Lấy tên người dùng hiện tại
    const currentUserName = currentUser?.name || currentUser?.user || currentUser?.username || 
                           localStorage.getItem('user_name') || 'bạn';
    
    const [message, setMessage] = useState('');

    // Reset message khi recipientName hoặc currentUserName thay đổi
    useEffect(() => {
        const defaultMessage = `Xin chào ${recipientName}, ${currentUserName} muốn liên hệ với bạn !`;
        setMessage(defaultMessage);
    }, [recipientName, currentUserName]);

    const handleSend = () => {
        if (message.trim()) {
            onSend(recipientName, message.trim());
            // Không gọi onClose() ở đây, để ChatPage xử lý đóng modal
        }
    };

    return (
        <div style={{
            height: '100%',
            maxHeight: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--card-bg)',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            <ContactRequestHeader onClose={onClose} />
            
            {/* Phần hiển thị người nhận */}
            <div style={{
                padding: '12px 16px',
                margin: '16px',
                marginBottom: 8,
                backgroundColor: '#fff',
                borderRadius: 8,
                border: '1px solid #DFDFDF',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexShrink: 0
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={getAvatarUrl(recipientName, 128)}
                        alt={recipientName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <strong style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: colors.normalText
                }}>
                    {recipientName}
                </strong>
            </div>

            {/* Textarea cho message */}
            <div style={{
                padding: '0 16px',
                marginTop: 8,
                marginBottom: 8,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    style={{
                        width: '100%',
                        flex: 1,
                        minHeight: '120px',
                        padding: '12px',
                        backgroundColor: '#FFFFFF',
                        color: colors.normalText,
                        borderRadius: 8,
                        border: '1px solid #DFDFDF',
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        resize: 'none',
                        lineHeight: '1.5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.cardBorder}
                    onBlur={(e) => e.target.style.borderColor = '#DFDFDF'}
                />
            </div>

            {/* Nút Gửi */}
            <div style={{
                padding: '0 16px 16px 16px',
                width: '100%',
                boxSizing: 'border-box',
                flexShrink: 0
            }}>
                <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    style={{
                        width: '100%',
                        padding: '12px 0',
                        backgroundColor: colors.primaryButton,
                        borderRadius: 8
                    }}
                >
                    Gửi
                </Button>
            </div>
        </div>
    );
};

export default ContactRequestModal;

