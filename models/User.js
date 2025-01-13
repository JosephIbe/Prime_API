const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const shortId = require('shortid')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        minLength: 8,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    referralCode: {
        type: String
    },
    referralPoints: {
        type: Number,
        default: 0
    },
    referralPointsUsed: {
        type: Number,
        default: 0
    },
    isVerifiedKYC: {
        type: Boolean,
        default: false
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    fcmToken: {
        type: String
    },
    reviews: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Reviews'
    },
})

// Encrypt password using bcryptjs
UserSchema.pre('save', async function(){
    let salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    // const code = `ago${shortId.generate()}ris`
    // console.log('generated user referral code:\t', code)

    // this.referralCode = code

})

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('Users', UserSchema)