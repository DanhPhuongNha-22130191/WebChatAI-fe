import { useContext } from 'react';
import { ApiContext } from './ApiContext.js';

export const useApi = () => {
    const context = useContext(ApiContext);
    
    if (!context) {
        throw new Error('useApi must be used within ApiProvider');
    }
    
    return context;
};
