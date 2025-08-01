

const { databaseinitialized, db, sequelize } = require('./models/index');


(async () => {
    await databaseinitialized; // Ensures everything is initialized before usage
})();


async function getSingleDeviceMetadata(userID, uniqueHash){

    let device = [];
    if(!userID || !uniqueHash) return null;

    try {

        let results = await db.User.findOne({
            attributes: ['id', 'email'], 
            where: {
                id: userID,
            },
            include: [
                {
                    model: db.Device,
                    as: 'devices',
                    attributes: [ 'uniqueHash','deviceName', 'serialNumber', 'updatedAt'],
                    where: {
                        uniqueHash
                    }
                },
            ],
        });

        if(!results) return null;

        const updatedAt =  results.devices[0].updatedAt.toISOString();
        const devices = results.devices.map(device => {
            const deviceObj = device.get({ plain: true });
            delete deviceObj.updatedAt;
            return deviceObj;
        });

        device.push({
            id: results.id,
            email: results.email,
            updatedAt,
            devices
        });
            
        return device;

    } catch (err) {
        console.log("Error: ", err);
        throw new Error('Failed to fetch users and devices');
    }
 }


  async function getAllUsersAndDevices(){

    try {
        const usersAndDevices = await db.User.findAll({
            attributes: ['id', 'email'], 
            include: [
                {
                    model: db.Device,
                    as: 'devices',
                    attributes: ['uniqueHash', 'deviceName', 'serialNumber', 'updatedAt'],
                },
            ],
        });

        let numberOfUsers = usersAndDevices.length;
        let userDevices = [];

        for(let count = 0; count < numberOfUsers; count++){
            // Find the latest updatedAt timestamp among all devices
            const updatedAt = usersAndDevices[count].devices.reduce((latest, device) => {
                const current = new Date(device.updatedAt);
                return current > latest ? current : latest;
            }, new Date(0)); // Start with epoch

            // Remove 'updatedAt' from individual devices.
            const sanitizedDevices = usersAndDevices[count].devices.map(({ uniqueHash, deviceName, serialNumber }) => ({
                uniqueHash,
                deviceName,
                serialNumber
            }));

            userDevices.push({
                id: usersAndDevices[count].id,
                email: usersAndDevices[count].email,
                updatedAt: updatedAt.toISOString(),
                devices: sanitizedDevices
            });
        }

        return userDevices;

    } catch (err) {
        console.log("Error: ", err);
        throw new Error('Failed to fetch users and devices');
    }
  }


  async function getUserDevices(userID){

    try {
        const usersAndDevices = await db.User.findOne({
            where: { id: userID } ,
            attributes: ['id', 'email'], 
            include: [
                {
                    model: db.Device,
                    as: 'devices',
                    attributes: ['deviceName', 'serialNumber', 'updatedAt'],
                },
            ],
        });

        if(!usersAndDevices) return null;
        let userDevices = [];

    
        // Find the latest updatedAt timestamp among all devices
        const updatedAt = usersAndDevices.devices.reduce((latest, device) => {
            const current = new Date(device.updatedAt);
            return current > latest ? current : latest;
        }, new Date(0)); // Start with epoch

        // Remove 'updatedAt' from individual devices.
        const sanitizedDevices = usersAndDevices.devices.map(({ deviceName, serialNumber }) => ({
            deviceName,
            serialNumber
        }));

        userDevices.push({
            id: usersAndDevices.id,
            email: usersAndDevices.email,
            updatedAt: updatedAt.toISOString(),
            devices: sanitizedDevices
        });
     

        return userDevices;

    } catch (err) {
        console.log("Error: ", err);
        throw new Error('Failed to fetch users and devices');
    }
  }


    // Add a new device to a user
  async function addDevice(userID, newDevice, topics){

    // const sequelize = await getSequelize();
    const transaction = await sequelize.transaction();


    try {
        
        const user = await db.User.findOne({
            where: { id: userID } ,
            transaction 
        });

        if (!user) {
            throw new Error('User not found');
        }

        await db.Device.update(
            { activeStatus: false }, // Update activeStatus
            {
                where: {
                    activeStatus: true, // Only update devices that are currently active
                },
            },
            { transaction }
        );
        
        const device = await db.Device.create(
            {
                userId: user.id,
                uniqueHash: newDevice.uniqueHash,
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
        
        await db.Topic.bulkCreate(topicsData , { transaction });
        
        await transaction.commit();

        return true;
    } catch (err) {
        await transaction.rollback();
        console.error("Error:", err);
        return false;
    }
  }



  module.exports = { getUserDevices, getAllUsersAndDevices, addDevice, getSingleDeviceMetadata };