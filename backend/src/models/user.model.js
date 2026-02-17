import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
    username : {
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
        enum: ['user', 'provider', 'admin'],   //Provides options for user roles 
        default: "user"   //sets default option as user
    },
    phone : {
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

//pre-hooks mongoose middleware
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();  //if password is not modified, move to next middleware{
    this.password = await bcrypt.hash(this.password, 10);  //hash the password with salt rounds of 10
    next();  //move to next middleware
})

//check check Password
userSchema.methods.checkPassword = async function (password){
    return await bcrypt.compare(password, this.password)
}

//access Token
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(                            //creates payload -> data you want to send inside the token
        {
            id: this._id,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//REFRESH TOKEN 
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign (
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model('User', userSchema); 
