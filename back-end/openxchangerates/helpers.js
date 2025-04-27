

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? './.env' : `./.env.${env}`;
require('dotenv').config({path: envFile});



const axios = require('axios');

const { getCurrencyCodes, mpesa_countries } =  require('../mpesa_countries/mpesa-countries.js');

const app_id = process.env.OPENXCHANGERATES_APP_ID;
const openXUrl = process.env.OPENXCHANGERATES_API_URL;
const baseCurrency = process.env.OPENXCHANGERATES_BASE_CURRENCY;


function formatExchangeRates(rates) {
    const formattedRates = {};
    for (const [key, value] of Object.entries(rates)) {
        const country = Object.values(mpesa_countries).find(country => country.currencyCode === key);
        if (country) {
            formattedRates[country.countryName] = {
                currencyCode: key,
                currencyName: country.currencyName,
                currencySymbol: country.currencySymbol,
                rate: value
            };
        }
    }
    return formattedRates;
}


async function getExchangeRates() {

    try {
        let  currencyCodes = getCurrencyCodes();
        const response = await axios.get(openXUrl, {
            params: {
                app_id: app_id,
                base: baseCurrency,
                symbols: currencyCodes
            }
        });
        let rates = response.data.rates;
        const formatedRates = formatExchangeRates(rates)
        return formatedRates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw new Error('Failed to fetch exchange rates');
    }
}


module.exports = {
    getExchangeRates
};