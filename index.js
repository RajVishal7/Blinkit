import express, { response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './Config/connectDB.js'
import userRoute from './route/user.route.js'
const app = express()
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({

    crossOriginResourcePolicy: false

}))
const port = 8080 || process.env.port

app.get("/", (request, response) => {
    response.json({
        message: "server is running" + port
    })
})

app.use('/api/user',userRoute)

connectDB().then(() => {
    app.listen(port, () => {
        console.log("server is running", port)
    })


})