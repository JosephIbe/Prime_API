const mongoose = require('mongoose')

const ProductsSchema = new mongoose.Schema({
   title: {
    type: String, 
    required: true
   },
   price: {
    type: String,
    required: true
   },
   images: {
      type: [String]
   },
   description: {
    type: String,
    required: true
   }
})

module.exports = mongoose.model('Products', ProductsSchema)