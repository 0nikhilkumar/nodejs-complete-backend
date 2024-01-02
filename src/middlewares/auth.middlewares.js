import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized token");
    }

    const decodedInformation = jwt.verify(
      token,
      process.env.ACCESS_SECRET_TOKEN
    );

    const user = await User.findById(decodedInformation?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Something went wrong while access token");
  }
});

export { verifyJWT };
