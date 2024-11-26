const express = require('express');
const router = express.Router();
const  generateCertificates  = require('../mqtt/mqtts-cert-generator');


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


router.post('/generate-certs' /*, isAuthenticated */ , async (req, res) => {
    try {
        const { serialNumber } = req.body;
        
        const result = await generateCertificates(serialNumber);

        if(result.status === 'success'){
            
            return res.status(200).json({ 
                clientCert: Buffer.from(result.data.clientCertificate).toString("base64"),
                clientKey: Buffer.from(result.data.privateKey).toString("base64"),
                rootCA: Buffer.from(result.data.caCert).toString("base64")
                // clientCert: result.data.clientCertificate,
                // clientKey: result.data.privateKey,
                // rootCA: result.data.caCert
            });  
        }
       
    } catch (err) {
        res.status(500).json({ error: "Error generating certificate" });
    }
});

module.exports = router;