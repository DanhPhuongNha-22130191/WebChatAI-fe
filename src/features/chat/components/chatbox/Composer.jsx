import React, { useState } from 'react';
import colors from '../../../../shared/constants/colors.js';

const Composer = ({ onSend, placeholder = "Soạn tin nhắn" }) => {
	const [message, setMessage] = useState('');

	const handleSend = () => {
		if (message.trim()) {
			onSend(message);
			setMessage('');
		}
	};

	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			padding: 12,
			backgroundColor: '#fff',
			borderTop: '1px solid #E0E0E0'
		}}>
			<div style={{ position: 'relative', width: '100%' }}>
				{/* Icon Mặt cười - bên trái */}
				<div style={{
					position: 'absolute',
					left: 12,
					top: '50%',
					transform: 'translateY(-50%)',
					display: 'flex',
					alignItems: 'center',
					color: colors.normalText,
					cursor: 'pointer'
				}}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<circle cx="12" cy="12" r="10" />
						<path d="M8 14s1.5 2 4 2 4-2 4-2" />
						<line x1="9" y1="9" x2="9.01" y2="9" />
						<line x1="15" y1="9" x2="15.01" y2="9" />
					</svg>
				</div>

				<input
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyPress={(e) => e.key === 'Enter' && handleSend()}
					placeholder={placeholder}
					style={{
						width: '100%',
						backgroundColor: '#FFFFFF',
						color: colors.normalText,
						padding: '12px 140px 12px 40px', // Padding phải lớn cho các icon
						borderRadius: 24,
						border: `1px solid ${colors.cardBorder}`,
						outline: 'none',
						fontSize: 15,
						boxSizing: 'border-box'
					}}
				/>

				{/* Container cho các icon bên phải */}
				<div style={{
					position: 'absolute',
					right: 12,
					top: '50%',
					transform: 'translateY(-50%)',
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					color: colors.normalText
				}}>
					{/* Nút ghi âm */}
					<div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
							<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
							<line x1="12" y1="19" x2="12" y2="23" />
							<line x1="8" y1="23" x2="16" y2="23" />
						</svg>
					</div>

					{/* Nút gửi ảnh */}
					<div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
					</div>

					{/* Nút sticker */}
					<div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" />
							<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
							<line x1="12" y1="17" x2="12.01" y2="17" />
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Composer;