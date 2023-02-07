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

// READ NOTIFICATION (PATCH)
export async function readNotification(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES
    const notIds = req.body.notIds;
    const userId = req.body.userId;

    // SET NOTIFICATIONS AS "READ" ON CURRENT USER
    notIds.map(async(not) => {
      const notification = await NotificationModel.findById(not);
      if(notification.receiver.toString() === userId) {
        console.log('IN');
        await NotificationModel.findByIdAndUpdate(not, {isRead: true}, {new: true});
      }
    });

    const exampleNot = await NotificationModel.findById(notIds[0]);
    res.status(200).json({
      message: "CHANGED isRead to TRUE was SUCCESSFULL!",
      status: true,
      data: exampleNot,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE NOTIFICATION (DELETE)
export async function deleteNotification(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES
    const notId = req.body.notId;
    const userId = req.body.userId;

    // DELETE FROM CURRENT USER
    const currUser = await UserModel.findByIdAndUpdate(userId, {$pull: {notifications: notId}});

    // DELETE NOTIFICATION
    const notification = await NotificationModel.findByIdAndDelete(notId);

    res.status(200).json({
      message: `Notification deleted from user and from database was SUCCESSFULL!`,
      status: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
}


