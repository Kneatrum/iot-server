const express = require('express');
// const { getModels } = require('../databases/postgres/models');
const bcrypt = require('bcryptjs');
const user_routes = express.Router();
// const { getSequelize } = require('../databases/postgres/models/index');
const { updateDeviceCache, removeDeviceMetadata } = require('../../back-end/deviceRegistry');
const { getUserDevices } = require('../databases/postgres/services');

const   dbInitPromise  = require('../databases/postgres/models/index');
const { isAuthenticated } = require('../auth/auth');


let db = null;
let sequelize = null;

(async () => {
    const init = await dbInitPromise; 
    db = init.db;
    sequelize = init.sequelize;
})();






user_routes.get('/test', async (req, res) => {
    return res.status(200).json({ message: 'Registration successful' });
});



// Register
user_routes.post('/register', async (req, res) => {
    const { userName, email, password } = req.body

    try {

        if (!db) {
            return res.status(500).json({ message: 'Database not initialized' });
        }


        const userExists = await db.User.findOne({ where: { email } });

        if(userExists){
            return res.status(409).json({ 
                message: 'A user with the provided Email address already exists.' 
            });
        }
        
        if(!userName || !email || !password){
            return res.status(400).json({
                message: 'Please provide all required fields.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await db.User.create({ userName, email, password: hashedPassword});

        const defaultRole = await db.Role.findOne({ where: { name: 'user' } });

        if (!defaultRole) {
            return res.status(500).json({ message: 'Default role not found' });
        }

        await newUser.addRole(defaultRole);

        return res.status(201).json({ message: 'Registration successful' });
    } catch(err){
        console.log(err)
        return res.status(500).json(err)
    }
});


// Log in
user_routes.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const sessionId = req.sessionID;

    try {
        const user = await db.User.findOne({ 
            attributes: ['id', 'password'],
            where: { email },
            include: [
                {
                    model: db.Role,
                    attributes: ['name'],
                    through: { attributes: [] }, // Exclude the join table attributes
                },
                {
                    model: db.Subscription,
                    as: 'subscriptions',
                    where: { status: 'active' },
                    required: false,
                    // attributes: [], // Optional: exclude subscription attributes if you only need the plan
                    include: [
                        {
                            model: db.Plan,
                            as: 'plan',
                            attributes: ['name'],
                        }
                    ],
                }
            ] 
        });
        

        if(!user){
            return res.status(401).json({ error: 'Unauthorized. Please sign up first.' });
        }

        const isValidPass = await bcrypt.compare(password, user.password);

        if(!isValidPass){
            return res.status(401).json({ error: 'Invalid password or email!' });
        }


        let roles = user.Roles.map(role => role.name);
        let plan = user.Subscription?.plan?.name;

        req.session.user = { id: user.id, roles, plan };

        req.session.save();

        const userDevices  = await getUserDevices(user.id);
        if ( userDevices){
            updateDeviceCache(userDevices, sessionId);
        }

        console.log( "Session :", req.session.user, );
        
        return res.status(200).json({ message: 'Login successful', roles, plan });  

    } catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});

// Log out
user_routes.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        res.status(200).json({message: 'Success'});
    });
});


// Get all users
user_routes.get('/', async (req, res) => {
    try {
        const users = await db.User.findAll();
        return res.send(users);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})

// Get user id
user_routes.get('/identity', isAuthenticated, async (req, res) => {
    try {
        const userID = req.session?.user?.id;
        if (!userID) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        return res.send(userID);
    } catch (err) {
       console.error("Unable to obtain user id:", err)
    }
});


user_routes.get('/status', isAuthenticated, async (req, res) => {
    return res.status(200).json({isAuthenticated: true})
});

module.exports.users = user_routes;