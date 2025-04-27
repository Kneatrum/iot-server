const express = require('express');
const axios = require('axios');
const mobile_money_routes = express.Router();


const { 
    getTimestamp, 
    getPassword, 
    getAccessToken, 
    getShortCode, 
    getCallbackURL,
    getProcessRequestURL
} = require('../mpesa_helpers/helpers');



// Route to initiate STK Push
mobile_money_routes.post('/stk-push', async (req, res) => {
    try {
        const { phoneNumber, amount } = req.body;
        
        // Validate inputs
        if (!phoneNumber || !amount) {
            return res.status(400).json({ error: 'Phone number and amount are required' });
        }
        
        // Format phone number
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = `254${phoneNumber.slice(1)}`;
        } else if (phoneNumber.startsWith('+254')) {
            formattedPhone = phoneNumber.slice(1);
        }
      
        // Get access token
        const accessToken = await getAccessToken();
        
        // Prepare STK Push request
        const timestamp = getTimestamp();
        const password = getPassword(timestamp);
        const shortCode = getShortCode();
        const callbackURL = getCallbackURL();
        const processRequestURL = getProcessRequestURL();
        
        // Prepare request data
        const data = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackURL,
            AccountReference: 'Test Payment',
            TransactionDesc: 'Test Payment'
        };
      
        // Make STK Push request
        const response = await axios.post(processRequestURL, data, {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
            }
        });
      
        // Return response to client
        return res.json({
            success: true,
            message: 'STK Push initiated successfully',
            data: response.data
        });

    } catch (error) {
        console.error('Error initiating STK Push:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to initiate STK Push',
            error: error.response?.data || error.message
        });
    }
});



// Callback route to receive STK Push response
mobile_money_routes.post('/callback', (req, res) => {
    console.log('STK Callback response:', JSON.stringify(req.body));
    
    // Extract info from callback
    const callbackData = req.body.Body.stkCallback;
    
    // Always respond to Safaricom with a success to acknowledge receipt
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    
    // Process the callback data as needed for your application
    if (callbackData.ResultCode === 0) {
      // Payment successful
      const transactionDetails = callbackData.CallbackMetadata.Item;
      // Process the successful payment
      console.log('Payment successful');
    } else {
      // Payment failed
      console.log('Payment failed:', callbackData.ResultDesc);
    }
  });
  
  module.exports.mobileMoney = mobile_money_routes;