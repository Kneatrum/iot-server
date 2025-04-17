
let deviceMap = new Map();

function updateDeviceCache(deviceData){

    const totalUsers = deviceData.length;

    for(let i = 0; i < totalUsers; i++){
        deviceData[i].devices.forEach(device => {
            addDeviceMetadata(device.uniqueHash, {
                user_id: deviceData[i].id,
                user_email: deviceData[i].email,
                updatedAt: deviceData[i].updatedAt,
                device_serial_no: device.serialNumber,
                device_name: device.deviceName,
            });
        });
    }
}

function addDeviceMetadata(uniqueHash, metadata) {
    deviceMap.set(uniqueHash, metadata);
}

function removeDeviceMetadata(uniqueHash) {
    deviceMap.delete(uniqueHash);
}

function getDeviceMetadata(uniqueHash) {
    return deviceMap.get(uniqueHash);
}

function getAllDeviceMetadata() {
    return deviceMap;
}

module.exports = {
    updateDeviceCache,
    addDeviceMetadata,
    removeDeviceMetadata,
    getDeviceMetadata,
    getAllDeviceMetadata
};  