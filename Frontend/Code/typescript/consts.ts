export const API_URL = 'http://127.0.0.1:8000/api';

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : ''
    };
}