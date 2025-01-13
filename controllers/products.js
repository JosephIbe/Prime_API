const ProductsModel = require('../models/Products')
const UserModel = require('../models/User')

const mongoose = require('mongoose')

/***
 *  @description Get all products listed
 *  @route POST /api/v1/products
 *  @access Private
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    console.log("getAllProducts endpoint hit")

    const { currentUserId } = req.body;
    console.log('currentUserId:\t', currentUserId)

    const products = await ProductsModel.find({
      $and: [
        { vendorId: { $ne: new mongoose.Types.ObjectId(currentUserId) } },
        { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } }
      ]
    })

    console.log('all products length:\n', products.length)
    console.log('all products:\n', products)

    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No products found that match your criteria.',
      })
    }

    if(products.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: products,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
    })
  } catch (error) {
    console.log(error)

    next(error)
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.toString(),
    })
  }
}

/***
 *  @description Search for any product listed
 *  @route POST /api/v1/search
 *  @access Private
 */
exports.searchProducts = async (req, res, next) => {
    try {

        const { query } = req.body
        console.log('search query', query)

        const products = await ProductsModel.aggregate(
            [
                {
                  $search: {
                    index: "products_search",
                    text: {
                      query: query,
                      path: {
                        wildcard: "*"
                      }
                    }
                  }
                }
              ]
        )
        return res.status(200)
                  .json({
                    success: true,
                    message: "Search completed",
                    data: products
                  })
    } catch(error){
        console.log(error)
    }
}

/***
 *  @description Get details of a product listed
 *  @route POST /api/v1/product-details
 *  @access Private
 */
exports.getSingleProduct = async (req, res, next) => {
    try{

        const {productId} = req.body
        console.log('productId:\t', productId)

        const product = await ProductsModel.find({_id: productId})
        console.log('product details:\n', product)

        if(!product) {
            return res.status(404)
                      .json({
                        success: false,
                        message: 'No product found'
                      })  
        }

        return res.status(200)
                  .json({
                    success: true,
                    message: `Product Retrieved Successfully`,
                    product: product[0],
                })    

    } catch(error){
        console.log(error)
    }
}

/***
 *  @description Get categories of all products listed
 *  @route POST /api/v1/products-category
 *  @access Private
 */
exports.getProductsInCategory = async (req, res, next) => {
    try {
        const { category } = req.body
        const categoryProducts = await ProductsModel.find({category: category})
    
        return res.status(200)
                  .json({
                    success: true,
                    message: `All Products in ${category} Category Retrieved Successfully`,
                    data: categoryProducts,
                })
        
    } catch(e){
        console.log(e)
    }
}

/***
 *  @description Make a price offer on a product listed
 *  @route POST /api/v1/make-offer
 *  @access Private
 */
exports.makeOffer = async (req, res, next) => {
    try {
        const {userId, vendorId, productId, offerAmount} = req.body

        const foundProduct = await ProductsModel.find({_id: productId})
        if(!foundProduct){
            return res.status(404)
                      .json({
                        success: false,
                        message: 'No such product exists'
                      })
        }

        const foundUser = await UserModel.find({_id: userId})
        console.log(foundUser)

        const firstName = foundUser[0].firstName
        const lastName = foundUser[0].lastName
        const userPhoneNumber = foundUser[0].phoneNumber

        const productTitle = foundProduct[0].title
        const image = foundProduct[0].images[0]

        const offer = await NotificationsModel.create({
            firstName,
            lastName,
            userId,
            vendorId,
            productId,
            productTitle,
            image,
            offerAmount,
            userPhoneNumber
        })
        if(offer != null){
            return res.status(201)
                      .json({
                        success: true,
                        message: `You have successfully made an offer to purchase this product for ${offerAmount}`,
                        offer
                      })
        }

    } catch(e){
        console.log(e)
    }
}

/***
 *  @description Get my products listed
 *  @route POST /api/v1/my-products
 *  @access Private
 */
exports.getMyProducts = async (req, res, next) => {
    try {
        const {vendorId} = req.body
    
        const products = await ProductsModel.find({vendorId})
        console.log('my products items:\n', products)
    
        return res.status(200)
                  .json({
                    success: true,
                    message: 'My Product Items Retrieved Succesfully',
                    data: products
                  })
    
    } catch(e){
        console.log(e)
    }
}

/***
 *  @description Get products listed by other vendors
 *  @route POST /api/v1/my-products
 *  @access Private
 */
exports.vendorProducts = async (req, res, next) => {
  try {
    const {vendorId} = req.body

    const products = await ProductsModel.find({vendorId})
    console.log('vendor listed products:\n', products)

    return res.status(200)
              .json({
                success: true,
                message: 'Vendor Product Listings Retrieved Succesfully',
                data: products
              })

  } catch(e){
      console.log(e)
  }
}

/***
 *  @description Create a chat history with the vendor of the product listed
 *  @route POST /api/v1/chat-seller
 *  @access Private
 */
exports.chatSeller = async (req, res, next) => {

    try {
        const {userId, vendorId} = req.body
        
        const createHistory = await ChatHistory.create({
            userId,
            vendorId
        })

        if(createHistory != null){
            return res.status(201)
                      .json({
                        success: true,
                        message: 'Success',
                      })
        }

    } catch(e){
        console.log(e)
    }

}

/***
 *  @description Delete a product listed
 *  @route POST /api/v1/delete-one
 *  @access Private
 */
exports.deleteProduct = async (req, res, next) => {

  try {

    const {productId} = req.body

    const product = await ProductsModel.find({_id: productId})
    console.log('found product to delete:\n', product)

    if(product == null){
      return res.status(404)
                .json({
                  success: false,
                  message: 'No product found'
                })
    }

    await ProductsModel.deleteOne({_id: productId})

    const deletedProduct = await ProductsModel.find({_id: productId})
    console.log('deletedProduct:\n', deletedProduct)

    if(deletedProduct == null){
      return res.status(200)
                .json({
                  success: true,
                  message: 'Product Deleted Successfully'
                })
    }

  } catch(e){
    console.log(e)
  }

}

/***
 *  @description Edit a product listed
 *  @route POST /api/v1/edit-one
 *  @access Private
 */
exports.editProduct = async (req, res, next) => {

  try {

    const {productId} = req.body

    const product = await ProductsModel.find({_id: productId})
    console.log('found product to edit:\n', product)

    if(product == null){
      return res.status(404)
                .json({
                  success: false,
                  message: 'No product found'
                })
    }

  } catch(e){
    console.log(e)
  }

}

/***
 *  @description Mark a product listed as sold/unavailable
 *  @route POST /api/v1/mark-product-as-sold
 *  @access Private
 */
exports.markProductAsSold = async (req, res, next) => {

  try {

    const {productId, isSold,} = req.body

    const fieldsToUpdate = {isSold}

    try {

      const product = await ProductsModel.find({_id: productId})
      console.log('found product to mark as sold:\n', product)

      if(product == null){
        return res.status(404)
                  .json({
                    success: false,
                    message: 'No product found'
                  })
      }

      const updatedProduct = await ProductsModel.findByIdAndUpdate(
        productId, 
        fieldsToUpdate, 
        {
          new: true,
          runValidators: true
        }
      )

      if(updatedProduct){
        return res.status(200)
                  .json({
                    success: true,
                    message: "Product Has Been Marked as Sold/Unavailable",
                    data: updatedProduct
                  })
      }
    } catch(err){
        console.log(err)
    }  

  } catch(e){
    console.log(e)
  }

}


exports.getAllSoldProducts = async (req, res, next) => {
  try {
    console.log("getAllSoldProducts endpoint hit")

    const { userId } = req.body 

    const soldProducts = await ProductsModel.find({
      vendorId: new mongoose.Types.ObjectId(userId),
      isSold: true,
    })

    console.log('sold products length:\n', soldProducts.length)
    console.log('sold products:\n', soldProducts)

    if (!soldProducts || soldProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sold products found for the specified user.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Sold products retrieved successfully',
      data: soldProducts,
    })
  
  } catch (error) {
    console.log(error)
    next(error)

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.toString(),
    })
  }
}