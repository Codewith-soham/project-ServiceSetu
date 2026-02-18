import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const helperSchema = new mongoose.Schema({
    helpername: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,  
    },
    role: {
        type: String,
        enum: ['user', 'helper', 'admin'],   //Provides options for user roles 
        default: "helper"   //sets default option as user
    },
    services: {
        type: String,
        enum: ['Maid', 'Electrician', 'Plumber', 'Care-Taker'],
        required: true,
        lowercase: true,
    },
    gender: {
        type: String,
        required: true,
    },
    phone : {
        type: String,
        required: true,
    },
    age:{
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    }
},
{
    timestamps: true    //will tell when it is created
}

)
