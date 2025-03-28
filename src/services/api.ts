import axios from 'axios';
//-    baseURL: 'http://192.168.80.241:8080/xcodeflow',
const api = axios.create({
    baseURL: 'http://192.168.80.241:8080/xcodeflow',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;