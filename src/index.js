import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'


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

app.get("/",(req,res)=>{
    res.send("hello there sam")
})

app.listen(port,()=>{
    console.log(`server is running on ${port}` )
})

