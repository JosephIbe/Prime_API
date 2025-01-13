const mongoose = require('mongoose')

const connectDB = async () => {
    let connection = await mongoose.connect(
        process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )

    console.log(`database connected with url:${connection.connection.host}`)

}

module.exports = connectDB