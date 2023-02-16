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
} from "../controller/usersController.js";
import { setMode } from "../controller/darkmodeController.js";

import { auth } from "../middleware/auth.js";

// ========================

// C R E A T E   R O U T E S
const userRouter = express.Router();

userRouter.route("/").get(getUsers);

userRouter
  .route("/add")
  .post(upload.single("avatar"), userValidator, validateRequest, addUser);

userRouter.route("/verify/:token").get(verifyEmail);

userRouter.route("/login").post(login);

userRouter.route("/checklogin").get(checkLogin);

userRouter.route("/logout").get(logout);

userRouter.route("/forgotpassword").post(forgotPassword);

userRouter.route("/reset/:token").get(verifyResetToken);

userRouter.route("/setnewpassword").post(setNewPassword);

userRouter.route("/follow/add").patch(auth, followUser);

userRouter.route("/follow/delete").delete(auth, leadUser);

userRouter.route("/darkmode").patch(setMode);

userRouter
  .route("/:id")
  .get(auth, getUser)
  .patch(upload.single("avatar"), auth, updateUser)
  .delete(auth, deleteUser);

export default userRouter;
