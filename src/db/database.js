import mongoose from "mongoose"

const connectDB = async ()=>{
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}Expense_Tracker`)
        console.log("Server Started Successfully.");
        
    } catch (error) {
        console.error("MongoDB connection failed in database.js,"+ error)
        process.exit(1)
    }
}

export {connectDB}