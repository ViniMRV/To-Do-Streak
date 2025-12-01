export const API_URL = 'https://potential-carnival-7vvqg5j99qx9fxxqv-8000.app.github.dev';

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}