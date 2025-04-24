
import axios from 'axios';

const backEndHost = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const certificatesRoute = '/ssl-services'
const usersRoute = '/users';
const plansRoute = '/plans';

const usersBaseUrl = `${backEndHost}${usersRoute}`
// const usersBaseUrl = `${usersRoute}`
const certsBaseUrl = `${backEndHost}${certificatesRoute}`
const subscriptionsBaseUrl = `${backEndHost}${plansRoute}`

const api = axios.create({
    baseURL: usersBaseUrl,
    withCredentials: true, 
});

const certsApi = axios.create({
    baseURL: certsBaseUrl,
    withCredentials: true, 
});

const plansApi = axios.create({
    baseURL: subscriptionsBaseUrl,
    withCredentials: true, 
})

export {api, certsApi, plansApi};