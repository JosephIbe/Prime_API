const User = require('../models/User')
const Products = require('../models/Products')
const Offers = require('../models/Offers')
const Chats = require('../models/Conversations')
const Reviews = require('../models/Ratings')
const Wishlist = require('../models/Wishlist')

/***
 *  @description Get user profile
 *  @route GET /api/v1/profile
 *  @access Private
 */
exports.getUserProfile = async (req, res, next) => {
    try{
        const { userId } = req.body

        const user = await User.findById(userId)
        console.log(user)

        if(!user) {
            return res.status(404)
                      .json({
                        success: false,
                        message: 'No user found'
                      })  
        }

        return res.status(200)
                  .json({
            success: true,
            message: `User Profile Retrieved Successfully`,
            user,
        })    

    } catch(error){
        console.log(error);
    }

}

/***
 *  @description Get logged in user's profile
 *  @route GET /api/v1/my-profile
 *  @access Private
 */
exports.getMyProfile = async (req, res, next) => {
    try{
        const { userId } = req.body

        const user = await User.findById(userId)
        console.log(user)

        if(!user) {
            return res.status(404)
                      .json({
                        success: false,
                        message: 'No user found'
                      })  
        }

        return res.status(200)
                  .json({
            success: true,
            message: `User Profile Retrieved Successfully`,
            user,
        })    

    } catch(error){
        console.log(error);
    }

}

/***
 *  @description Update user profile
 *  @route PUT /api/v1/update-profile
 *  @access Private
 */
exports.updateMyProfile = async (req, res, next) => {

    try{

        const {userId, firstName, lastName, state, city, phoneNumber} = req.body

        const fieldsToUpdate = {firstName, lastName, state, city, phoneNumber}

        try{
            const user = await User.findById(userId)
            if(!user){
                return res.status(404)
                          .json({
                            success: false,
                            message: "No such user exists"
                          })   
            }
            console.log('found user profile to update:\n', user)

            const updatedUser = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
                new: true,
                runValidators: true,
            })
            if(updatedUser){
                return res.status(200)
                          .json({
                            success: true,
                            message: "Your profile has been updated",
                            user: updatedUser
                          })
            }
        } catch(err){
            console.log(err)
        }

    } catch(error){
        console.log(error);
    }

}

/***
 *  @description Sets Firebase Token for Sending Push Notifications
 *  @route PUT /api/v1/set-fcm-token
 *  @access Private
 */
exports.setFCMPushTokenOnUser = async (req, res, next) => {

    try{

        const {userId, fcmToken} = req.body

        const fieldsToUpdate = {fcmToken}

        try{
            const user = await User.findById(userId)
            
            if(!user){
                return res.status(404)
                          .json({
                            success: false,
                            message: "No such user exists"
                          })   
            }
            console.log('found user profile to update:\n', user)

            const updatedUser = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
                new: true,
                runValidators: true,
            })
            if(updatedUser){
                return res.status(200)
                          .json({
                            success: true,
                            message: "Your FCM Push Token has Been Saved Successfully",
                            user: updatedUser
                          })
            }
        } catch(err){
            console.log(err)
        }

    } catch(error){
        console.log(error);
    }

}

/***
 *  @description Permanently deletes a user profile
 *  @route PUT /api/v1/delete-my-account
 *  @access Private
 */
exports.deleteMyAccount = async (req, res, next) => {

    const {userId} = req.body

    const user = await User.findById(userId)
    console.log(user)

    if(!user) {
        return res.status(404)
                      .json({
                        success: false,
                        message: 'No user found'
                      })  
    }

    const products = await Products.find({vendorId: userId})
    console.log(`userProducts:\n${products}`)

    const offers = await Offers.find({vendorId: userId})
    console.log(`user offers:\n${offers}`)
    await Offers.deleteOne({_id: userId})

    const reviews = await Reviews.find({vendorId: userId})
    console.log(`user reviews:\n${reviews}`)
    await Reviews.deleteOne({_id: userId})

    const wishlist = await Wishlist.find({vendorId: userId})
    console.log(`user wishlist:\n${wishlist}`)
    await Wishlist.deleteOne({_id: userId})

    const chats = await Chats.find({vendorId: userId})
    console.log(`user chats:\n${chats}`)
    await Chats.deleteOne({_id: userId})

    await User.deleteOne({_id: userId})

    const deletedUser = await User.findById(userId)
    console.log(`deletedUser:\n${deletedUser}`)

    if(deletedUser == null){
        return res.status(200)
                  .json({
                    success: true,
                    message: 'Profile Deleted Successfully'
                  })
    }

}