import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './db/index.js'

dotenv.config({
    path: "./.env"
})

const app = express()
const port = process.env.PORT || 8000

app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "DELETE", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}))

import healthCheckRouter from './routes/healthcheck.routes.js'

app.use("/api/v1/healthcheck",healthCheckRouter)


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