const fs = require('fs');
const path = require('path');

const ratesFilePath = path.join(__dirname, 'exchangeRatesBackup.json');

let exchangeRates = {};
let lastUpdated = null;

/**
 * Set exchange rates in memory and save to file.
 * @param {Object} rates - New exchange rates.
 */
function setExchangeRates(rates, saveToFile = true) {
    if (typeof rates !== 'object' || rates === null) {
        throw new Error('Invalid exchange rates format. Expected an object.');
    }
    if (saveToFile) {
        saveRatesToFile();
    }
    // Update in-memory rates
    exchangeRates = rates;
    lastUpdated = new Date().toISOString();
}

/**
 * Get current in-memory exchange rates.
 * @returns {Object} Exchange rates.
 */
function getStoredExchangeRates() {
    return exchangeRates;
}

/**
 * Save the current exchange rates to disk.
 */
function saveRatesToFile() {
    const data = {
        timestamp: lastUpdated,
        rates: exchangeRates
    };

    try {
        fs.writeFileSync(ratesFilePath, JSON.stringify(data, null, 2));
        console.log('Exchange rates saved to file.');
    } catch (error) {
        console.error('Failed to save exchange rates to file:', error.message);
    }
}

/**
 * Load exchange rates from file on startup or fallback.
 */
function loadRatesFromFile() {
    if (fs.existsSync(ratesFilePath)) {
        try {
            const data = fs.readFileSync(ratesFilePath, 'utf-8');
            const parsed = JSON.parse(data);
            exchangeRates = parsed.rates || {};
            lastUpdated = parsed.timestamp || null;
            console.log(`Exchange rates loaded from backup file. Last updated: ${lastUpdated}`);
            return { exchangeRates, lastUpdated };
        } catch (error) {
            console.error('Failed to load exchange rates from file:', error.message);
        }
    } else {
        console.warn('No exchange rates backup file found. Skipping load.');
    }
}

module.exports = {
    setExchangeRates,
    getStoredExchangeRates,
    loadRatesFromFile
};
