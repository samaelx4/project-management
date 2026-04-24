import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './db/index.js'
import cookieParser from 'cookie-parser'

dotenv.config({
    path: "./.env"
})

const app = express()
const port = process.env.PORT || 8000

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "DELETE", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}))

import healthCheckRouter from './routes/healthcheck.routes.js'
import authRouter from './routes/auth.routes.js'

app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)

connectDB()
    .then(()=>{
        app.listen(port,()=>{
            console.log(`app listening on port http://localhost:${port}`)
        })
    })
    .catch((err)=>{
        console.log("MongoDB connection error",err);
        process.exit();
    })