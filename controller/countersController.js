// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();


// I M P O R T:  F U N C T I O N S
import UserModel from "../models/userModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue";
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

// READ NOTIFICATION (PATCH)
export async function increaseCounter(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES
    const userId = req.body.userId;

    // const user = await UserModel.findById(userId);
    // const loginCountValue = user.meta.loginCount;

    const user = await UserModel.findByIdAndUpdate(userId, {"meta.loginCount": loginCount+1});    
    res.status(200).json({
      message: "LoginCount SUCCESSFULL increased by one",
      data: user,
      status: true
    });
  } catch (err) {
    next(err);
  }
}


