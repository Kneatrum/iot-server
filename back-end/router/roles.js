
const express = require('express');

const roles = express.Router();

const dbInitPromise  = require('../databases/postgres/models/index');
const { isAuthenticated } = require('../auth/auth');

let db = null;
let sequelize = null;

(async () => {
    const init = await dbInitPromise; 
    db = init.db;
    sequelize = init.sequelize;
})();


roles.get('/', isAuthenticated, async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ message: 'Database not initialized' });
        }

        const roles = await db.Role.findAll({
            // attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        return res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports.roles = roles;