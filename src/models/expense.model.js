import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
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
        default: "expense"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
    
}, {timestamps: true})

export const Expense = mongoose.model("Expense", expenseSchema)