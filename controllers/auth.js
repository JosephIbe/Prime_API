const UserModel = require('../models/User')

const {registerSchema, loginSchema} = require('../utils/validation_schema')

const OTPVerification = require("../models/OTPVerification")
const bcrypt = require("bcryptjs")
const sendEmail = require('../utils/email')

exports.registerUser = async (req, res, next) => {
    try{

        const {firstName, lastName, email, password,} = req.body
        console.log('req payload sent in register:\n', req.body)

        const doesExist = await UserModel.findOne({email: email});
        if(doesExist) {
            return res.status(409)
                      .json({
                        success: false,
                        message: `This email ${email} is taken`
                      })  
        }

        const user = await UserModel.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            verifiedEmail: false
        })

        const token = user.getSignedJwtToken()

        if(user != null){

            try{

                const user = await UserModel.findOne({email:req.body.email})
                if(!user) {
                    return res.status(409)
                              .json({
                                success: false,
                                message: `The email ${email} is not registered with Prime E-Health`
                              })  
                }
            
                const otp = `${Math.floor(100000 + Math.random() * 90000)}`
                console.log('otp\t', otp)

                const message = `Hello ${user.firstName}, \n\n Welcome to Prime E-Health\n\n Please use this secure code\t${otp}\t to verify your email inside the app. \n\n This code will expire in 1 hour. \n\n\n From,\nThe Assessment Development Team`
        
                try{
                    const saltRounds = 10
                    const hashedOtp = await bcrypt.hash(otp, saltRounds)

                    OTPVerification.create({
                        userId: user.id,
                        otp: hashedOtp,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 3600000
                    })

                    await sendEmail({
                        email: req.body.email,
                        subject: "Verify Your Email Address",
                        message
                    })

                    return res.status(201)
                      .json({
                        success: true,
                        message: `Registration successful. A secure code has been sent to ${email} for verification`,
                        user,
                        token
                      })      
                } catch(err){
                    console.log(`err sending mail\n${err}`)
                }
        
            } catch(error){
                console.log(error);
            }
                          
        }

    } catch(error){
        console.log(error);
    }
}


/***
 *  @description Verify new signup's email address with otp
 *  @route POST /api/v1/verify-email
 *  @access Public
 */
exports.verifyEmail = async (req, res, next) => {
    try{

        const { userId, otp, email } = req.body
        console.log('req payload sent in verify email:\n', req.body)

        const user = await UserModel.findOne({email})
        if(!user) {
            return res.status(404)
                      .json({
                        success: false,
                        message: `The email ${email} is not registered with Prime Health`
                      })  
        }

        try{

            if(!userId || !otp){
                return res.status(400)
                      .json({
                        success: false,
                        message: 'Please enter the OTP sent to your email'
                      })  
            } else {

                const record = await OTPVerification.find({userId})
                console.log('record\n', record)
                
                const recordId = record[0]._id
                console.log('record id\n', record[0]._id)

                if(record.length <= 0) {
                    return res.json(404)
                            .status({
                                success: false,
                                message: "Invalid account or this OTP has already been used. Please sign up again or login"
                            })  
                } else {
                    const {expiresAt} = record
                    const hashedOtp = record[0].otp

                    if(expiresAt < Date.now()){
                        // await record.findByIdAndRemove({recordId})
                        await record.remove({})
                        // await record.deleteMany({})

                        return res.json(404)
                            .status({
                                success: false,
                                message: "This secure sode has expired. Please try another one"
                            })  
                    } else {
                        const isValid = bcrypt.compare(otp, hashedOtp)
                        if(!isValid){
                            return res.json(400)
                            .status({
                                success: false,
                                message: "Incorrect OTP"
                            })  
                        } else {
                            await UserModel.updateOne({_id: userId}, {verifiedEmail: true})
                            // await record.remove({})
                            // await record.findByIdAndRemove({recordId})
                            // await record.delete({userId})
                            // await record.deleteMany({})
                    
                            const message = `Hello ${user.firstName}, Your email has been verified. Happy Shopping on Prime Health\n\n \n\n\n From,\nThe Development Team`
                            await sendEmail({
                                email: req.body.email,
                                subject: "Welcome to Prime Health",
                                message,
                                amp: ``
                            })
                            return res.status(200)
                                    .json({
                                        success: true,
                                        message: "Email Verification Successful"
                                    }) 
                        }
                    }
                }
            }

        } catch(err){   
            console.log(`err sending mail\n${err}`)
        }

    } catch(error){
        console.log(error);
    }
}

/***
 *  @description Logs in existing users
 *  @route POST /api/v1/login
 *  @access Public
 */
exports.loginUser = async (req, res, next) => {
    try{

        console.log('req payload sent in login:\n', req.body)
        const validationResult = await loginSchema.validateAsync(req.body)

        const user = await UserModel.findOne({email: validationResult.email}).select('+password')
        if(!user) {
            return res.status(404)
                      .json({
                        success: false,
                        message: `Invalid Credentials`
                      })  
        }

        const isPasswordMatch = await user.matchPassword(req.body.password)
        console.log('!isPasswordMatch', !isPasswordMatch)
        console.log()

        if(!isPasswordMatch){
            return res.status(409)
                      .json({
                        success: false,
                        message: `Invalid Credentials`
                      })  
        }

        const token = user.getSignedJwtToken()
        console.log('jwt token\n', token)

        
        if(user != null){
            console.log('user details to be logged in:\n', user)
            return res.status(200)
            .json({
                success: true,
                message: 'Login successful',
                user,
                token
            })  
        }

    } catch(error){
        console.log(error);
    }

}