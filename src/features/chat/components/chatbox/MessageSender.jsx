import React from 'react';
import colors from '../../../../shared/constants/colors.js';

const MessageSender = ({ text, timestamp }) => (
	<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 12 }}>
		<div style={{
			backgroundColor: colors.chatSenderBackground,
			color: colors.normalText,
			padding: '14px 22px',
			borderRadius: 20,
			minWidth: 0,
			maxWidth: 500,
			width: 'fit-content',
			lineHeight: '1.6',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
			wordBreak: 'break-word',
			whiteSpace: 'pre-wrap'
		}}>
			{text}
		</div>
		{timestamp && <span style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{timestamp}</span>}
	</div>
);

export default MessageSender;