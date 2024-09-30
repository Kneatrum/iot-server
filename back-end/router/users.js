const express = require('express');
const { User } = require('../databases/postgres/models');
const bcrypt = require('bcryptjs');
const user_routes = express.Router();


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, redirect to login or return unauthorized response
        return res.redirect('/login');
    }
}

// Register
user_routes.post('/register', async (req, res) => {
    const { userName, email, password } = req.body

    try {
        const userExists = await User.findOne({ where: { email } });

        if(userExists){
            console.log("A user already exists with the same email address")
            return res.redirect('/register')
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({ userName, email, password: hashedPassword });
        res.send(user)
        // return res.redirect('/login')
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
            console.log("No user is registered under the provided email");
            return res.redirect('/login');
        }

        const isValidPass = await bcrypt.compare(password, user.password);

        if(!isValidPass){
            console.log("Wrong password. Please try again.");
            return res.redirect('/login');
        }

        req.session.user = user;
        res.send(req.session)
        // return res.redirect('/dashboard');     
    } catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});

// Log out
user_routes.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect('/');
    });
});


// Get all users
user_routes.get('/', async (req, res) => {
    try {
        // console.log(req.session);
        // console.log(req.sessionID);
        const users = await User.findAll();
        return res.send(users);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})


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


module.exports = user_routes;