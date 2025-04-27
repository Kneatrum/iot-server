
const express = require('express');

const router = express.Router();


const { getStoredExchangeRates } = require('../exchange_rates/exchange-rates-store.js');
const { isAuthenticated } = require('../auth/auth.js');


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const rates = getStoredExchangeRates();
        res.json(rates);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
});



module.exports = router;