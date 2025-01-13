const http = require('http')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')
const connectDB = require ('./config/database')

dotenv.config({path: './config.env'})

const app = express()

const server = http.createServer(app)

app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

const auth = require('./routes/auth')
const profile = require('./routes/profile')
const products = require('./routes/products')

app.get('/', (req, res, next)=>{
    res.send('Welcome to Prime API Server')
})

app.use('/api/v1/auth', auth)
app.use('/api/v1/user', profile)
app.use('/api/v1/products', products)

const port = process.env.PORT || 6000

connectDB()
    .then(()=> {
        console.log('process.env.MONGO_URI ====>\t', process.env.MONGO_URI)
        server.listen(port, ()=>{
        console.log(`Server lives on port ${port}`)
    })
}).catch((err)=> {
    console.log('process.env.MONGO_URI ====>\t', process.env.MONGO_URI)
    console.error(`err is ${err} and error message connecting to database is:\n${err.message}`)
    process.exit(1)
})

// handle unhandled promise rejection warnings
process.on('unhandledRejection', (err, promise)=>{
    console.log('process.env.MONGO_URI ====>\t', process.env.MONGO_URI)
    console.log(`Error: ====> Unhandled Rejection  ====> ${err.message}`)
  
    //close the server and exit the process
    server.close(()=>{
        process.exit(1)
    })
  
    throw(`err is ${err} and error message is:\n${err.message}`)
})