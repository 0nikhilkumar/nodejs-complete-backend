import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyAdmin = asyncHandler(async (req, _, next) => {
    const isAdminRole = req.user.isAdmin;
    if(!isAdminRole){
        throw new ApiError(403, "Access denied. User is not an admin")
    }

    next();
});

export { verifyAdmin };
