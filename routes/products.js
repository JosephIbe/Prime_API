const express = require('express')
const router = express.Router()

const {protect} = require('../middlewares/auth')

const multer = require('multer')

const ProductsModel = require('../models/Products')

const {
    getAllProducts,
    getSingleProduct,
} = require('../controllers/products')

router.post('/all', protect, getAllProducts)
router.post('/product-details', protect, getSingleProduct)

module.exports = router