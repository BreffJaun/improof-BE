// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

// I M P O R T:  F U N C T I O N S
import ProjectModel from '../models/projectModel.js';
import UserModel from "../models/userModel.js";
import StoneModel from "../models/stoneModel.js";
import NotificationModel from "../models/notificationModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue";
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

// DELETE NOTIFICATION
export async function deleteNotification(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES
    const notId = req.body.notId;
    const userId = req.body.userId;

    // DELETE FROM CURRENT USER
    const currUser = await UserModel.findByIdAndUpdate(userId, {$pull: {notifications: notId}});

    // CHECK IF THE NOTIFICATION IS STILL IN OTHER USERS START//
    const allUsers = await UserModel.find();
    const allNotifications = allUsers.map((user) =>  user.notifications.includes(notId)).every(element => element === false);
    if(allNotifications) {
      const notification = await NotificationModel.findByIdAndDelete(notId);
    }
    // CHECK IF THE NOTIFICATION IS STILL IN OTHER USERS END//

    res.status(200).json({
      message: 
        allNotifications ?
        "DELETE of the COMPLETE notification was SUCCESSFULL!" : "DELETE of the notification ONLY from the user was SUCCESSFULL!",
      status: true,
      data: "",
    });
  } catch (err) {
    next(err);
  }
}
