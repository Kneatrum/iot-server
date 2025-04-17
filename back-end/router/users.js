const express = require('express');
// const { getModels } = require('../databases/postgres/models');
const bcrypt = require('bcryptjs');
const user_routes = express.Router();
// const { getSequelize } = require('../databases/postgres/models/index');
const { updateDeviceCache, removeDeviceMetadata } = require('../../back-end/deviceRegistry');
const { getUserDevices } = require('../databases/postgres/services');

const   dbInitPromise  = require('../databases/postgres/models/index');

const { 
    getAllUsersAndDevices,
    addDevice, 
    getSingleDeviceMetadata 
} = require('../databases/postgres/services');

let db = null;
let sequelize = null;

(async () => {
    const init = await dbInitPromise; 
    db = init.db;
    sequelize = init.sequelize;
})();


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

        console.log("Received :", userName, password, email)
        const userExists = await db.User.findOne({ where: { email } });

        if(userExists){
            return res.status(409).json({ 
                message: 'A user with the provided Email address already exists.' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await db.User.create({ userName, email, password: hashedPassword });
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
        const user = await db.User.findOne({ where: { email } });

        if(!user){
            return res.status(401).json({ error: 'Unauthorized. Please sign up first.' });
        }

        const isValidPass = await bcrypt.compare(password, user.password);

        if(!isValidPass){
            return res.status(401).json({ error: 'Invalid password or email!' });
        }

        req.session.user = { id: user.id, email: user.email };
        req.session.save();

        const userDevices  = await getUserDevices(user.id);
        if ( userDevices){
            updateDeviceCache(userDevices, sessionId);
        }
        
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
        const users = await db.User.findAll();
        return res.send(users);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})


// Get all device data
user_routes.get('/get-devices',  isAuthenticated,  async (req, res) => {
    try {
        const devices = await db.Device.findAll();
        return res.send(devices);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})

// Get devices by their names and serial numbers
user_routes.get('/device-details', async (req, res) => { 
    try {
        
        const user = req.session.user

        if(!user){
            return res.status(401).json({ error: 'Unauthorized. Please sign up first.' });
        }

        const devices = await db.Device.findAll({
            attributes: ['userId', 'deviceName', 'serialNumber', 'activeStatus'], // Select only deviceName and serialNumber
            include: [
                {
                    model: db.Layout,
                    as: 'layouts',
                    attributes: ['layout'],
                    include:[
                        {
                            model: db.Chart,
                            as: 'chart',
                            attributes: ['config', 'chartType', 'dateSpan']
                        }
                    ]
                },
                {
                    model: db.Topic,
                    as: 'topics',
                    attributes: ['id', 'description', 'topic']
                }
            ],
            where: {
                userId: user.id
            }
        }); 

        // Return the mapped array
        return res.json(devices); 
    } catch (err) { 
        console.error("Error: ", err); 
        return res.status(500).json({ error: "Something went wrong" }); 
    } 
});


user_routes.post('/disable-previous-device', isAuthenticated, async (req, res) => {
    // const sequelize = await getSequelize();
    const transaction = await sequelize.transaction();

    try {
        await db.Device.update(
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
    const { newDevice, topics } = req.body;
    const userID = req.session.user.id;
    try {
        await addDevice(userID, newDevice, topics);
        return res.status(201).json({ message: 'Device added successfully' });
    } catch {
        return res.status(500).json({ error: "Something went wrong" }); 
    }
    // const transaction = await sequelize.transaction(); 
});


user_routes.post('/update-device-cache', isAuthenticated, async (req, res) => {
    const { uniqueHash } = req.body;
    const userID = req.session.user.id;

    try {
        const metadata = await getSingleDeviceMetadata(userID, uniqueHash);
        if (!metadata) {
            return res.status(404).json({ error: 'Device not found' });
        }
        updateDeviceCache(metadata);
        return res.status(200).json({ message: 'Cache updated successfully' });
    } catch {
        return res.status(500).json({ error: "Failed to update cache" }); 
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
        const device = await db.Device.findOne({
            where: {
                serialNumber,
                //userId: user.id // Ensure the device belongs to the current user
            }
        });

        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Delete the device and associated topics
        await db.Topic.destroy({ where: { deviceId: device.id } }); // Delete associated topics
        await device.destroy(); // Delete the device itself

        removeDeviceMetadata(serialNumber);

        return res.status(200).json({ message: 'Device deleted successfully' });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

user_routes.get('/check-serial-number', isAuthenticated, async (req, res) => {
    const { serialNumber } = req.query; 
    const userID = req.session.user.id; 
    console.log("#############3", serialNumber);
    console.log("**************", userID);

    try {
        
        if (!serialNumber) {
            return res.status(400).json({ error: 'Serial number is required' });
        }

        const user = await db.User.findOne({
            where: { id: userID }
        });

        // Find the device with the given serial number (and optionally user association)
        const device = await db.Device.findOne({
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
    const { chartId, deviceId, description, topic } = req.body;
    const userID = req.session.user.id;

    try {
        // const user = await db.Device.findOne({
        //     where: { 
        //         id: userID
        //     }
        // });

        await db.Topic.create({ chartId, deviceId, description, topic });

        return res.status(201).json({ message: 'Topic added successfully' });
    } catch (err){
        console.log("Error: ", err)
        return res.status(500).json({ error : "Something went wrong"})
    }
})


user_routes.get('/user-devices', isAuthenticated, async (req, res) => {
    const id = req.session.user.id;
    const email = req.session.user.email;

    try {
        const devices = await db.Device.findAll({
            attributes: ['deviceName', 'serialNumber', 'updatedAt'], 
            where: { userId: id }
        });

        // Find the latest updatedAt timestamp among all devices
        const updatedAt = devices.reduce((latest, device) => {
            const current = new Date(device.updatedAt);
            return current > latest ? current : latest;
        }, new Date(0)); // Start with epoch

        // Remove 'updatedAt' from individual devices if you don't want it in the response
        const sanitizedDevices = devices.map(({ deviceName, serialNumber }) => ({
            deviceName,
            serialNumber
        }));

        const userDevices = {
            myDevices: {
                id,
                email,
                updatedAt: updatedAt.toISOString(),
                devices: sanitizedDevices
            }
        };

        return res.send(userDevices);
    } catch (err) {
        console.log("Error: ", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});



user_routes.get('/all-users-devices', async (req, res) => {

    try {
        const usersAndDevices =  await getAllUsersAndDevices();
        return res.send(usersAndDevices);
    } catch (err) {
        console.log("Error: ", err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});



// Get all topics
user_routes.get('/topic', /*isAuthenticated,*/ async (req, res) => { /**/
    // const userID = req.session.user.uuid;

    try {
        // const topic = await db.Topic.findAll({
        //     where: { 
        //         uuid: userID
        //     }
        // });
        // console.log(req.session);
        // console.log(req.sessionID);
        const topic = await db.Topic.findAll();
        return res.send(topic);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})

// Get all layouts
user_routes.get('/layouts', /*isAuthenticated,*/ async (req, res) => { /**/
    // const userID = req.session.user.uuid;

    try {
        const layouts = await db.Layout.findAll();
        return res.send(layouts);
    } catch (err){
        console.log("Error: ", err);
        return res.status(500).json({ error : "Something went wrong"});
    }
})


user_routes.delete('/topic/', async (req, res) => {
    const { topic } = req.body;

    try {
        // Find the topic by the topic string itself
        const topicToDelete = await db.Topic.findOne({
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
    // const sequelize = await getSequelize();
    const transaction = await sequelize.transaction();
    
    try {
    //   const user = await User.create({
    //     /* user data */
    //   }, { transaction });
  
      const page = await Page.create({
        userId: user.id,
        /* page layout data */
      }, { transaction });
  
      const chart = await db.Chart.create({
        pageId: page.id,
        /* chart data */
      }, { transaction });

      const topic1 = await db.Topic.create({ name: 'Topic 1', userId: user.id });
      const topic2 = await db.Topic.create({ name: 'Topic 2', userId: user.id });

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
    const userID = req.session.user.id;

    try {
        const user = await db.User.findOne({
            where: { 
                id: userID
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
    const userID = req.session.user.id;
    try {
        const user = await db.User.findOne({
            where: { 
                id: userID
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
    const userID = req.session.user.id;

    try {
        const user = await db.User.findOne({
            where: { 
                id: userID,
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

user_routes.post('/batch-updates', async (req, res) => {
    // const sequelize = await getSequelize();
    const transaction = await sequelize.transaction();
    const userID = req.session.user.id;


    try {
        const { changes } = req.body;
        
        const user = await db.User.findOne({
            where: { 
                id: userID
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        

        for(let i = 0; i < changes.length; i++){

            const device = await db.Device.findOne({
                where: {
                    userId: user.id,
                    serialNumber: changes[i].serialNumber
                },
                transaction
            });

            if (!device) {
                throw new Error(`Device not found for  ${changes[i].dbAction} and ${changes[i].serialNumber}`);
            }

            if (changes[i].dbAction === "appendLayout") {

                const layout = changes[i].dbPayload.newLayout;
                const chart = changes[i].dbPayload.chart;

                // Check for existing layout
                const existingLayout = await db.Layout.findOne({
                    where: sequelize.literal(`layout->>'i' = '${layout.i}'`),
                    transaction
                });

                if (existingLayout) {
                    console.log(`Layout with id ${layout.i} already exists`);
                    continue; // Skip to next change
                }


                const layoutData = {
                    deviceId: device.id,
                    layout
                };

                console.log("Saving layout")
                let createdLayout = await db.Layout.bulkCreate([layoutData], { transaction }); 
                          
                    
                const chartData = {
                    layoutId: createdLayout[0]?.dataValues?.id,
                    config: chart.newChart,
                    chartType: chart.newChart.type || "Line",
                    dateSpan: chart.dateSpan
                };

                const createdChart = await db.Chart.bulkCreate([chartData], { transaction });
                
            } else if(changes[i].dbAction === "updateLayout") {
                const data = changes[i].layoutChanges;

                const layoutId = changes[i].layoutIndex; 
            
                // Find the existing layout first
                const existingLayout = await db.Layout.findOne({
                    where: sequelize.literal(`layout->>'i' = '${layoutId}'`),
                    transaction
                });
            
                if (!existingLayout) {
                    console.log(`Layout with id ${layoutId} not found`);
                    continue;
                }
            
                // Create a new layout object with updated values
                const updatedLayout = {
                    ...existingLayout.layout,
                    ...data
                };
            
                // Update the layout
                await db.Layout.update(
                    { layout: updatedLayout },
                    {
                        where: sequelize.literal(`layout->>'i' = '${layoutId}'`),
                        transaction
                    }
                );
            }
        }

        await transaction.commit();
        return res.json("Yaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaay");


    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        console.error("Batch operation failed:", error);
        return res.status(500).json({
            error: "Batch operation failed",
            details: error.message
        });
    }
});


// Update a chart
user_routes.put('/:chart', isAuthenticated, async (req, res) => {
    const { chart } = req.params;
    const userID = req.session.user.id;

    try {
        const user = await db.User.findOne({
            where: { 
                id: userID
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

module.exports.users = user_routes;