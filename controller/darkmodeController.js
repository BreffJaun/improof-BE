// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();

// I M P O R T:  F U N C T I O N S
import UserModel from "../models/userModel.js";

export async function setMode(req, res, next) {
  try {
    const userId = req.body.userId;
    const darkModeValue = req.body.darkMode;
    const user = await UserModel.findById(userId);
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {
      meta: { ...user.meta, darkMode: darkModeValue },
    });
    res.json({
      message: "you switched mode",
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}
