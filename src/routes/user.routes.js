import { Router } from "express";
import { Upload } from "../middlewares/multer.middleware.js";
import { changeAvatarImage, changeUserName, changeUserPassword, deleteUserAccount, login, logout, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(Upload.single('avatar'), register)
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout)
router.route("/change-password").patch(verifyJWT, changeUserPassword);
router.route("/change-name").patch(verifyJWT, changeUserName);
router.route("/change-profile-image").patch(Upload.single("avatar"), verifyJWT, changeAvatarImage);
router.route("/delete-account").delete(verifyJWT, deleteUserAccount);

export default router;
