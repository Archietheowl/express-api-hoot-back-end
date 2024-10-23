
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next){
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Assign decoded payload to req.user
        req.user = decoded;

        next();
    }catch(error){
        res.status(401).json({ error: 'Invalid token.'});
    }
}

module.exports = verifyToken;