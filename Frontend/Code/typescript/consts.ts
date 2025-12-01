export const API_URL = 'https://vigilant-train-q7v45w55xxqj39xp7-8000.app.github.dev';

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}