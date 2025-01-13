const express = require('express')
const router = express.Router()

const {protect} = require('../middlewares/auth')

const {
    create,
    getAllProducts,
    getSingleProduct,
} = require('../controllers/products')

router.post('/create', protect, create)
router.post('/all', protect, getAllProducts)
router.post('/product-details', protect, getSingleProduct)

module.exports = router