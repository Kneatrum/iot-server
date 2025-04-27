// exchange-rate-cronjob.js

const cron = require('node-cron');
const { getExchangeRates } = require('../openxchangerates/helpers.js');
const { setExchangeRates, loadRatesFromFile } = require('../exchange_rates/exchange-rates-store.js');

// This cron job fetches exchange rates from Open Exchange Rates API and updates the local store.
// Immediately fetch once when the server starts
(async () => {
    console.log('Fetching initial exchange rates...');
    try {
        const now = new Date();
    
        // Load exchange rates from the file
        const results = loadRatesFromFile();

        if (results && results.timestamp && results.rates) {
            const timestampDate = new Date(results.timestamp);
            const hoursDifference = (now.getTime() - timestampDate.getTime()) / (1000 * 60 * 60);  // Get difference in hours
            
            // If rates are less than 24 hours old, load from file
            if (hoursDifference < 24) {
                console.log('Exchange rates are less than 24 hours old. Loading from file...');
                setExchangeRates(results.rates);
                return; // Early return to avoid fetching rates again
            }
        }

        // If no valid rates or if the rates are older than 24 hours, fetch fresh data
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        console.log('Exchange rates updated from API.');
        console.log("Exchange rates:", rates);
       
    } catch (error) {
        console.error('Failed to fetch initial exchange rates:', error.message);
    }
})();

// Schedule: Once a day at 12:05 AM
cron.schedule('5 0 * * *', async () => {
    console.log('Fetching exchange rates at 12:05 AM...');
    try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
        console.log('Exchange rates updated successfully.');
    } catch (error) {
        console.error('Failed to update exchange rates:', error.message);
        console.log('Attempting to load previous exchange rates from file...');
        loadRatesFromFile();
    }
});
