
import axios from 'axios';

const backEndHost = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const usersRoute = '/users';
const baseUrl = `${backEndHost}${usersRoute}`

const api = axios.create({
    baseURL: baseUrl,
    withCredentials: true, 
});

export default api;