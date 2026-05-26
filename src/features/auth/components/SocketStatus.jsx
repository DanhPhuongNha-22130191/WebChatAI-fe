import React from 'react';

const SocketStatus = ({ isReady }) => {
    return (
        <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
            Server:
            <span style={{ color: isReady ? 'green' : 'red', fontWeight: 'bold', marginLeft: 5 }}>
                {isReady ? "Online" : "Offline"}
            </span>
        </div>
    );
};

export default SocketStatus;
