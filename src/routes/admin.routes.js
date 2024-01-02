import { Router } from "express";
import { deleteUserById, getAllUsers, updateUserAvatar, updateUserById } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { Upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/users").get(verifyJWT, verifyAdmin, getAllUsers);
router.route("/users/delete-user/:id").delete(verifyJWT, verifyAdmin, deleteUserById);
router.route("/users/update/:id").patch(verifyJWT, verifyAdmin, updateUserById);
router.route("/users/update-avatar/:id").patch(verifyJWT, verifyAdmin, Upload.single("avatar"), updateUserAvatar);

export default router;
