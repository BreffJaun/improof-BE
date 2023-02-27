// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";

// I M P O R T:  F U N C T I O N S
import { validateRequest } from "../middleware/validator.js";
import {
  userValidator,
  // ,
  // userUpdateValidator
} from "../middleware/userValidator.js";
import { upload } from "./medias.js";

// I M P O R T:  C O N T R O L L E R
import {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  login,
  checkLogin,
  logout,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  followUser,
  leadUser,
  setNewPassword,
  setFirstLogin
} from "../controller/usersController.js";
import { setMode } from "../controller/darkmodeController.js";

import { auth } from "../middleware/auth.js";

// ========================

// C R E A T E   R O U T E S
const router = express.Router();

router.route("/").get(getUsers);

router
  .route("/add")
  .post(userValidator, validateRequest, addUser);

router.route("/verify/:token").get(verifyEmail);

router.route("/login").post(login);

router.route("/checklogin").get(checkLogin);

router.route("/logout").get(logout);

router.route("/forgotpassword").post(forgotPassword);

router.route("/reset/:token").get(verifyResetToken);

router.route("/setnewpassword").post(setNewPassword);

router.route("/follow/add").patch(auth, followUser);

router.route("/follow/delete").delete(auth, leadUser);

userRouter.route("/darkmode").patch(setMode);

userRouter.route("/firstlogin/:userId").patch(setFirstLogin);

router
  .route("/:id")
  .get(auth, getUser)
  .patch(upload.single("avatar"), auth, updateUser)
  .delete(auth, deleteUser);

export default router;
