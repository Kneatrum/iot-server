
import axios from 'axios';

const backEndHost = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const certificatesRoute = '/ssl-services'
const usersRoute = '/users';

const usersBaseUrl = `${backEndHost}${usersRoute}`
const certsBaseUrl = `${backEndHost}${certificatesRoute}`

const api = axios.create({
    baseURL: usersBaseUrl,
    withCredentials: true, 
});

const certsApi = axios.create({
    baseURL: certsBaseUrl,
    withCredentials: true, 
});

export {api, certsApi};