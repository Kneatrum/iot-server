const express = require('express');
const { User, Device, Topic, Chart, Layout } = require('../databases/postgres/models');
const bcrypt = require('bcryptjs');
const user_routes = express.Router();
const { sequelize } = require('../databases/postgres/models/index');


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, redirect to login or return unauthorized response
        // return res.redirect('/login');
        return res.status(401).json({ error: "Unauthorized" });
    }
}

// Register
user_routes.post('/register', async (req, res) => {
    const { userName, email, password } = req.body

    try {
        console.log("Received :", userName, password, email)
        const userExists = await User.findOne({ where: { email } });

        if(userExists){
            return res.status(409).json({ 
                message: 'A user with the provided Email address already exists.' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({ userName, email, password: hashedPassword });
        return res.status(201).json({ message: 'Registration successful' });
    } catch(err){
        console.log(err)
        return res.status(500).json(err)
    }
});


// Log in
user_routes.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.status(401).json({ error: 'Unauthorized. Please sign up first.' });
        }

        const isValidPass = await bcrypt.compare(password, user.password);

        if(!isValidPass){
            return res.status(401).json({ error: 'Invalid password or email!' });
        }

        req.session.user = user;
        
        return res.status(200).json({ message: 'Login successful' });  

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
        const users = await User.findAll();
        return res.send(users);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})


// Get all device data
user_routes.get('/get-devices', async (req, res) => {
    try {
        const devices = await Device.findAll();
        return res.send(devices);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})

// Get devices by their names and serial numbers
user_routes.get('/device-details',  async (req, res) => { 
    try { 
        const devices = await Device.findAll({
            attributes: ['deviceName', 'serialNumber', 'activeStatus'] // Select only deviceName and serialNumber
        }); 
        
        // Map the devices to return an array of objects with deviceName and serialNumber
        const deviceInfo = devices.map(device => ({
            name: device.deviceName,
            serial: device.serialNumber,
            activeStatus: device.activeStatus
        }));
        
        // Return the mapped array
        return res.json(deviceInfo); 
    } catch (err) { 
        console.error("Error: ", err); 
        return res.status(500).json({ error: "Something went wrong" }); 
    } 
});


user_routes.post('/disable-previous-device', isAuthenticated, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        await Device.update(
            { activeStatus: false }, // Update activeStatus
            {
                where: {
                    activeStatus: true, // Only update devices that are currently active
                },
            },
            { transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: 'Device disabled successfully' });

    } catch (err) {
        await transaction.rollback();
        console.error("Error:", err);
        return res.status(500).json({ error: "Something went wrong" }); 
    }
});


// Add new device
user_routes.post('/add-device', isAuthenticated, async (req, res) => {
    const transaction = await sequelize.transaction();
    const { newDevice, topics } = req.body;
    const userID = req.session.user.uuid;

    // const transaction = await sequelize.transaction(); 

    try {
        
        const user = await User.findOne({
            where: { uuid: userID } ,
            transaction 
        });

        if (!user) {
            throw new Error('User not found');
        }

        await Device.update(
            { activeStatus: false }, // Update activeStatus
            {
                where: {
                    activeStatus: true, // Only update devices that are currently active
                },
            },
            { transaction }
        );
        
        const device = await Device.create(
            {
                userId: user.id,
                deviceName: newDevice.deviceName,
                serialNumber: newDevice.serialNumber,
                activeStatus: newDevice.activeStatus
            },
            { transaction }
        );
        
        const topicsData = topics.map(({ description, topic }) => ({
            deviceId: device.id,
            description,
            topic
        }));
        
        await Topic.bulkCreate(topicsData , { transaction });
        
        await transaction.commit();

        return res.status(201).json({ message: 'Device added successfully' });
    } catch (err) {
        await transaction.rollback();
        console.error("Error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});


// Delete device by serial number
user_routes.delete('/delete-device/:serialNumber', /*isAuthenticated,*/ async (req, res) => {
    const { serialNumber } = req.params; // Get serial number from URL parameters
    // const userID = req.session.user.uuid; // Retrieve user ID from session

    try {
        // Find the user
        // const user = await User.findOne({
        //     where: { uuid: userID }
        // });

        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }

        // Find the device by serial number and associated user
        const device = await Device.findOne({
            where: {
                serialNumber,
                //userId: user.id // Ensure the device belongs to the current user
            }
        });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Delete the device and associated topics
        await Topic.destroy({ where: { deviceId: device.id } }); // Delete associated topics
        await device.destroy(); // Delete the device itself

        return res.status(200).json({ message: 'Device deleted successfully' });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

user_routes.get('/check-serial-number', isAuthenticated, async (req, res) => {
    const { serialNumber } = req.query; 
    const userID = req.session.user.uuid; 
    console.log("#############3", serialNumber);
    console.log("**************", userID);

    try {
        
        if (!serialNumber) {
            return res.status(400).json({ error: 'Serial number is required' });
        }

        const user = await User.findOne({
            where: { uuid: userID }
        });

        // Find the device with the given serial number (and optionally user association)
        const device = await Device.findOne({
            where: {
                serialNumber,
                userId: user.id, 
            },
        });

        
        if (device) {
            return res.status(200).json({ exists: true, message: 'Serial number exists' });
        } else {
            return res.status(200).json({ exists: false, message: 'Serial number does not exist' });
        }
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});


// Add Topic
user_routes.post('/topic', isAuthenticated, async (req, res) => {
    const { description, topic } = req.body;
    const userID = req.session.user.uuid;

    try {
        const user = await User.findOne({
            where: { 
                uuid: userID
            }
        });

        await Topic.create({ userId: user.id, description, topic });

        return res.status(201).json({ message: 'Topic added successfully' });
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})


// Get all topics
user_routes.get('/topic', /*isAuthenticated,*/ async (req, res) => { /**/
    // const userID = req.session.user.uuid;

    try {
        // const topic = await Topic.findAll({
        //     where: { 
        //         uuid: userID
        //     }
        // });
        // console.log(req.session);
        // console.log(req.sessionID);
        const topic = await Topic.findAll();
        return res.send(topic);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})


user_routes.delete('/topic/', async (req, res) => {
    const { topic } = req.body;

    try {
        // Find the topic by the topic string itself
        const topicToDelete = await Topic.findOne({
            where: { topic: topic }
        });

        if (!topicToDelete) {
            return res.status(404).json({ error: "Topic not found" });
        }

        // Delete the topic
        await topicToDelete.destroy();

        return res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (err) {
        console.log("Error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});



async function createPageAndCharts() {
    const transaction = await sequelize.transaction();
    
    try {
    //   const user = await User.create({
    //     /* user data */
    //   }, { transaction });
  
      const page = await Page.create({
        userId: user.id,
        /* page layout data */
      }, { transaction });
  
      const chart = await Chart.create({
        pageId: page.id,
        /* chart data */
      }, { transaction });

      const topic1 = await Topic.create({ name: 'Topic 1', userId: user.id });
      const topic2 = await Topic.create({ name: 'Topic 2', userId: user.id });

      // Assuming you have the chart and topics already created
      await chart.addTopics([topic1.id, topic2.id], { transaction });
  
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

// Add dashboard
user_routes.post('/dashboard', isAuthenticated, async (req, res) => {
    const { topic } = req.params;
    const userID = req.session.user.uuid;

    try {
        const user = await User.findOne({
            where: { 
                uuid: userID
            }
        });

        user.topic = topic;
        await user.save(); 

        res.send(user);
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})


// Update a topic
user_routes.put('/:topic', isAuthenticated, async (req, res) => {
    const { topic } = req.params;
    const userID = req.session.user.uuid;
    try {
        const user = await User.findOne({
            where: { 
                uuid: userID
            }
        });

        user.topic = topic;
        await user.save(); 

        res.send(user);
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})

// Update a dashboard
user_routes.put('/:dashboard', isAuthenticated, async (req, res) => {
    const { dashboard } = req.params;
    const userID = req.session.user.uuid;

    try {
        const user = await User.findOne({
            where: { 
                uuid: userID,
            }
        });

        user.dashboard = dashboard;
        await user.save();

        res.send(user);
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})

// Update a chart
user_routes.put('/:chart', isAuthenticated, async (req, res) => {
    const { chart } = req.params;
    const userID = req.session.user.uuid;

    try {
        const user = await User.findOne({
            where: { 
                uuid: userID
            }
        });
        
        user.chart = chart;
        await user.save();

        res.send(user);
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})


user_routes.get('/status', isAuthenticated, async (req, res) => {
    return res.status(200).json({isAuthenticated: true})
});

module.exports = user_routes;