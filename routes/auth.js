const express = require('express')
const router = express.Router()

const {
    registerUser,
    verifyEmail,
    loginUser,
} = require('../controllers/auth')

router.post('/register', registerUser)
router.post('/verify-email', verifyEmail)
router.post('/login', loginUser)

module.exports = router