import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    title: {
        type: String,
        lowerCase: true,
        trim: true,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        default: 0,
        required: true
    },
    type:{
        type: String,
        default: "income"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
    
}, {timestamps: true})

export const Income = mongoose.model("Income", incomeSchema)