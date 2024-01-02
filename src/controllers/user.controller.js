import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { email, phone, password, name } = req.body;

  if (!(email || phone)) {
    throw new ApiError(401, "Email or phone is required to register");
  }
  if (!password || !name) {
    throw new ApiError(401, "Either Password or Name is missing");
  }

  const userExists = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  const avatarLocalFilePath = req.file?.path;
  if (!avatarLocalFilePath) {
    throw new ApiError(404, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalFilePath);

  if (!avatar) {
    throw new ApiError(401, "Avatar file missing");
  }

  const user = await User.create({
    email,
    password,
    phone,
    name,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;
  if (!(email || phone)) {
    throw new ApiError(401, "Either Email or Phone is missing");
  }
  if (!password) {
    throw new ApiError(401, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPassCorrect = await user.isPasswordCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { refreshToken, accessToken },
        "User Successfully login"
      )
    );
});

const logout = asyncHandler(async(req, res)=> {
  await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      refreshToken: undefined
    }
  },{new: true});

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logout successfully"));
})

const changeUserPassword = asyncHandler(async (req, res)=> {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isOldPasswordCorrect){
        throw new ApiError(401, "Invalid Old Password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res.status(200).json(new ApiResponse(200, {} ,"User Password Changed Successfully"));
})

const changeUserName = asyncHandler(async(req, res)=> {
    const { newName } = req.body;
    const user = await User.findById(req.user?._id);
    
    user.name = newName;
    await user.save({validateBeforeSave: false});
    return res.status(200).json(new ApiResponse(200, user, "Name Changed Successfully"));
})

const changeAvatarImage = asyncHandler(async(req, res) => {
    const avatarLocalFile = req.file?.path;
    if(!avatarLocalFile){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalFile);
    if(!avatar.url){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    },{
        new: true
    }).select("-password -refreshToken");

    return res.status(200)
    .json(new ApiResponse(200, user ,"Profile Image changed successfully"));
    
})

const deleteUserAccount = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user?._id);
    if(!user){
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, {}, "User Account Successfully Deleted"));
})

export { register, login, logout, changeUserPassword, changeUserName, changeAvatarImage, deleteUserAccount };
