import axios from "axios";

const backendServer = import.meta.env.VITE_PRESTABANCO_BACKEND_SERVER;
const backendPort = import.meta.env.VITE_PRESTABANCO_BACKEND_PORT;

console.log('Backend Server:', backendServer);
console.log('Backend Port:', backendPort);

const API = axios.create({
    baseURL: `http://${backendServer}:${backendPort}`,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Agregar interceptor para token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;