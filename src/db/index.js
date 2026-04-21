import mongoose from 'mongoose'

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGOOSE_URI);
        console.log("MongoDB is connnected")
    } catch (error) {
        console.log("Mongoose connection eroor", error)
    }
}

export default connectDB