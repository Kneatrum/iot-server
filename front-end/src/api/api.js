
import axios from 'axios';

const backEndHost = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

const certificatesRoute = '/api/ssl-services'
const usersRoute = '/api/users';
const pricingRoutes = '/api/pricing';
const exchangeRatesRoute = '/api/exchange-rates';
const mpesaRoute = '/api/mpesa';
const devicesRoute = '/api/devices';

const usersBaseUrl = `${backEndHost}${usersRoute}`
// const usersBaseUrl = `${usersRoute}`
const certsBaseUrl = `${backEndHost}${certificatesRoute}`
const pricingBaseUrl = `${backEndHost}${pricingRoutes}`
const exchangeRatesBaseUrl = `${backEndHost}${exchangeRatesRoute}`
const mpesaBaseUrl = `${backEndHost}${mpesaRoute}`
const devicesBaseUrl = `${backEndHost}${devicesRoute}`

const devicesApi = axios.create({
    baseURL: devicesBaseUrl,
    withCredentials: true, 
});

const api = axios.create({
    baseURL: usersBaseUrl,
    withCredentials: true, 
});

const certsApi = axios.create({
    baseURL: certsBaseUrl,
    withCredentials: true, 
});

const plansApi = axios.create({
    baseURL: pricingBaseUrl,
    withCredentials: true, 
})

const exchangeRatesApi = axios.create({
    baseURL: exchangeRatesBaseUrl,
    withCredentials: true
})

const mpesaApi = axios.create({
    baseURL: mpesaBaseUrl,
    withCredentials: true
})

export {api, certsApi, plansApi, exchangeRatesApi, mpesaApi, devicesApi};