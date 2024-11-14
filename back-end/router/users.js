const express = require('express');
const { User, Device, Topic, Chart, Layout } = require('../databases/postgres/models');
const bcrypt = require('bcryptjs');
const user_routes = express.Router();


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


// Get available devices
user_routes.get('/device_names', isAuthenticated, async (req, res) => { 
    try { 
        const devices = await Device.findAll({
            attributes: ['deviceName']
        }); 
        const deviceNames = devices.map(device => device.deviceName);
        return res.send(deviceNames); 
    } catch (err){ 
        console.log("Error: ", err); 
        return res.status(500).json({ error : "Something went wrong"}); 
    } 
});



// Add new device
user_routes.post('/device', isAuthenticated, async (req, res) => {
    const { newDeviceData } = req.body;
    const userID = req.session.user.uuid;

    try {
        const user = await User.findOne({
            where: { 
                uuid: userID
            }
        });

        const device = await Device.create({ 
            userId: user.id, 
            deviceName: newDeviceData.deviceName, 
            serialNumber: newDeviceData.serialNumber 
        });

        const topicsData = newDeviceData.topics.map(({ description, topic }) => ({
            deviceId: device.id,
            description,
            topic
        }));
        
        await Topic.bulkCreate(topicsData);

        return res.status(201).json({ message: 'Device added successfully' });
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})




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