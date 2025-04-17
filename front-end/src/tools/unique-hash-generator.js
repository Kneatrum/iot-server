

async function generateUniqueId(uuid, serialNumber) {
    const combined = `${uuid}${serialNumber}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hexHash.substring(0, 12);
}


module.exports = generateUniqueId;