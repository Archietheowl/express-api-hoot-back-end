// controllers/test-jwt.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')

//!--- Sign Token Route
router.get('/sign-token', (req, res) => {
    const user = {
        _id: 1,
        username: 'test',
        password: 'test',
    };
    // Creating the token by using the sign method and passing in the two required arguments "Payload" and "Secret Key"
    // Notice the syntax and also that it must be in side the route
    const token = jwt.sign({ user }, process.env.JWT_SECRET);

    // Having created the token lets send that back to the client
    res.json({ token });
});

//!--- Verifying Token Route
router.post('/verify-token', (req, res) => {
    try{//!-- Keeping below as a reminder of syntax for testing routes with a message
        // res.json({message: 'Token is valid.'});
        const token = req.headers.authorization.split(' ')[1];
        // Adding in a verification method
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ decoded })    
    }catch(error){
        res.status(401).json({ error: 'Invalid token.' });
        //Below retained for testing
        //res.json({ token })
    }
});


module.exports = router;
