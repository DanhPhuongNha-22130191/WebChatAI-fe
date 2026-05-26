import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const ChatPlaceholder = () => (
	<div style={{
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
		color: colors.primaryText
	}}>
		<div style={{ marginBottom: 20 }}>
			<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
		</div>
		<h2 style={{ margin: '0 0 12px 0', fontSize: 24, fontWeight: 'bold' }}>Chọn một cuộc trò chuyện để bắt đầu</h2>
		<p style={{ margin: 0, fontSize: 16, opacity: 0.8 }}>Chọn từ danh sách bên trái hoặc thêm cuộc trò chuyện mới</p>
	</div>
);

export default ChatPlaceholder;