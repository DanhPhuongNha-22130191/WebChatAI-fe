import React from 'react';

const MessageTimestamp = ({ timestamp }) => (
    <div style={{
        textAlign: 'center',
        margin: '16px 0',
        fontSize: 13,
        color: '#666'
    }}>
        {timestamp}
    </div>
);

export default MessageTimestamp;
