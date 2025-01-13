const mongoose = require("mongoose")

const OTPSchema = new mongoose.Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date
})

module.exports = mongoose.model("OTPVerification", OTPSchema)