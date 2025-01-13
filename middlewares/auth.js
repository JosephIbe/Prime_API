const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
        console.log('token in protect middleware:\t', token)
    }

    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        })
    }

    // Verify token with JWT
    try {
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        // console.log('decodedToken:\t', decodedToken)

        req.user = User.findById(decodedToken.id)
        // console.log('req.user{\t', req.user)

        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        })
    }
}