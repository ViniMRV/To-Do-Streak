export const API_URL = 'http://127.0.0.1:8000';

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        // JWT requires 'Bearer' prefix
        'Authorization': token ? `Bearer ${token}` : ''
    };
}