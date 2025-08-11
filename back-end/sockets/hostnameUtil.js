const { execSync } = require('child_process');

function getWindowsHostIP() {
    try {
        const result = execSync("cat /etc/resolv.conf | grep nameserver | awk '{print $2}'", 
            { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        console.error('Error getting Windows IP:', error);
        return null;
    }
}

function getURL() {
    const hostIP = getWindowsHostIP();
    return `http://${hostIP}:8085/data.json`;
}


module.exports = { getURL };
