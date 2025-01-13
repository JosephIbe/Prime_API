const express = require('express')
const router = express.Router()

const {protect} = require('../middlewares/auth')

const {
    getMyProfile,
    getUserProfile,
    updateMyProfile,
    deleteMyAccount
} = require('../controllers/profile')

router.post('/my-profile', protect, getMyProfile)
router.post('/profile', protect, getUserProfile)
router.put('/update-profile', protect, updateMyProfile)
router.post('/delete-my-account', protect, deleteMyAccount)

module.exports = router