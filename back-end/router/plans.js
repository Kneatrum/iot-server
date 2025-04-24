const express = require('express');

const plans = express.Router();

const dbInitPromise  = require('../databases/postgres/models/index');
const { isAuthenticated } = require('../auth/auth');

let db = null;
let sequelize = null;

(async () => {
    const init = await dbInitPromise; 
    db = init.db;
    sequelize = init.sequelize;
})();

plans.get('/', isAuthenticated, async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ message: 'Database not initialized' });
        }

        const plans = await db.Plan.findAll({
            attributes: [
                'id', 
                'name', 
                'price', 
                'deviceLimit', 
                'dataRetentionDays', 
                'uploadRate', 
                'protocols', 
                'chartsLimit', 
                'storage'
            ],
            order: [['price', 'ASC']]
        });

        return res.status(200).json(plans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports.plans = plans;