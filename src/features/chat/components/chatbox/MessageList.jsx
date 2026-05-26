import React from 'react';
import MessageSender from './MessageSender.jsx';
import MessageReceiver from './MessageReceiver.jsx';
import MessageTimestamp from './MessageTimestamp.jsx';

const MessageList = ({ messages }) => (
	<div style={{
		flex: 1,
		padding: 16,
		display: 'flex',
		flexDirection: 'column',
		overflowY: 'auto',
		backgroundColor: '#FFE5F0'
	}}>
		{messages.map((m, i) => {
			if (m.type === 'timestamp') {
				return <MessageTimestamp key={i} timestamp={m.text} />;
			}
			return m.me
				? <MessageSender key={i} text={m.text} timestamp={m.timestamp} />
				: <MessageReceiver key={i} text={m.text} sender={m.sender} timestamp={m.timestamp} showAvatar={m.showAvatar} />;
		})}
	</div>
);

export default MessageList;