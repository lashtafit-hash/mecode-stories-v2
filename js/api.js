// API конфигурация
const REMOTE_API = "https://web-production-3a26.up.railway.app";
const API = (window.location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(window.location.hostname))
    ? 'http://127.0.0.1:5000'
    : REMOTE_API;

// Флаг для переключения на v2 (пока false)
const USE_V2 = false;

const api = {
    async call(endpoint, options = {}) {
        const url = USE_V2 && endpoint === '/generate' 
            ? '/generate-v2' 
            : endpoint;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (auth.token) {
            headers['Authorization'] = `Bearer ${auth.token}`;
        }
        
        try {
            const response = await fetch(`${API}${url}`, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : null
            });
            
            if (response.status === 401 && auth.token) {
                auth.logout();
                throw new Error('Сессия истекла');
            }
            
            return await response.json();
        } catch (e) {
            console.error('API error:', e);
            throw e;
        }
    }
};
