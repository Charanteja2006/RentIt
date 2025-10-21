import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/api-response.js';
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from '../utils/async-handler.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken,refreshToken};

    } catch(error){
        throw new ApiError(500,"Something went wrong. Please try again.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {email,username,password} = req.body;

    const existedUser = await User.findOne({$or: [{email},{username}]})

    if(existedUser){
        throw new ApiError(401,"User with given email or username already exists.");
    }

    const user = await User.create({email,username,password});

    await user.save({validateBeforeSave: false});

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong. Please try again.")
    }

    return res
        .status(201)
        .json(new ApiResponse(201,{
            user: createdUser},
            "User registered successfully. Please check your email to verify your account."
    ));
})

const login = asyncHandler(async (req,res) =>{
    const {email,password} = req.body;

    if(!email){
        throw new ApiError(400,"Email is required to login.");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400,"User with given email does not exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400,"Password is not correct.");
    }

    const {accessToken,refreshToken} =  await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    const options = {
        httpOnly: true,
        secure : true,
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{
            user: loggedInUser,
            accessToken,refreshToken
        },"User logged in successfully."));

})

const logoutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken: ""
            }
       },
       {
            new : true,
       }
    );
    const options = {
        httpOnly: true,
        secure : true,
    }
 
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out successfully."));
}); 

const getCurrentUser = asyncHandler(async (req,res) =>{
    return res
        .status(200)
        .json(new ApiResponse(200,
        req.user,
        "Current user fetched successfully."
    )
    );
})



const changeCurrentPassword = asyncHandler(async (req,res) =>{
    const {oldPassword,newPassword} = req.body;

    const user = User.findById(req.user._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    
    if(!isPasswordValid){
        throw new ApiError(400,"Old password is not correct.");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: true});

    return res
        .status(200)
        .json(new ApiResponse(200,{},"Password changed successfully."));
})

const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh token is missing.");
    }

    try{
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decodedToken._id);

        if(!user){
            throw new ApiError(401,"Invalid refresh token. User not found.");
        }

        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401,"Invalid refresh token.");
        }

        const options = {
            httpOnly: true,
            secure : true,
        }

        const {accessToken,refreshToken : newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

        user.refreshToken = newRefreshToken;

        await user.save();

        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(new ApiResponse(200,{
                accessToken,
                refreshToken: newRefreshToken
            },"Access token refreshed successfully."));


    } catch(error){
        throw new ApiError(401,"Invalid refresh token.");
    }
})
    
export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    changeCurrentPassword,
    refreshAccessToken
}
    