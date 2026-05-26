import React from 'react';

const AuthError = ({ error }) => {
    if (!error) return null;

    return (
        <div style={{ background: '#ffebee', color: '#c62828', padding: 10, borderRadius: 5, marginBottom: 15, fontSize: 14 }}>
            {error}
        </div>
    );
};

export default AuthError;
