import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllUsers = asyncHandler(async (_, res) => {
  const user = await User.find().select("-password -refreshToken");
  if(!user || user.length === 0){
    throw new ApiError(400, "No Users found");
  }
  return res.status(200).json(new ApiResponse(200, user, "All Users get successfully"));
});

const deleteUserById = asyncHandler(async (req, res)=> {
  const userId = req.params.id;

  const user = await User.findByIdAndDelete(userId);

  if(!user){
    throw new ApiError(404, "User account does not exists");
  }

  return res.status(200).json(new ApiResponse(200, {}, `User account:${user?._id} is successfully deleted`));
});

const updateUserById = asyncHandler(async (req, res)=> {
  const userId = req.params.id;
  const {name, email, phone, password} = req.body;

  const user = await User.findById(userId).select("-password -refreshToken");

  if(!user){
    throw new ApiError(400, "User not found");
  }

  user.name = name;
  user.email = email;
  user.phone = phone;
  user.password = password;

  await user.save({validateBeforeSave: false})

  return res.status(200)
  .json(new ApiResponse(200, user, "User Updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res)=> {

  try {
    const userId = req.params.id;
    const avatarLocalFilePath = req.file?.path;

  if(!avatarLocalFilePath){
    throw new ApiError(401, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalFilePath);

  if(!avatar){
    throw new ApiError(400, "Avatar file is required")
  }

  const updatedUser = await User.findByIdAndUpdate(userId, {
    $set: {
      avatar: avatar.url,
    }
  }, {new: true});

  if(!updatedUser){
    throw new ApiError(400, "Something went wrong while updating user avatar")
  }

  return res.status(200).json(new ApiResponse(200, {}, "User Avatar Successfully Updated"));

  } catch (error) {
    
  }
})

export { getAllUsers, deleteUserById, updateUserById, updateUserAvatar };
