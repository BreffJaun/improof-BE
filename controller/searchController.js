// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

// I M P O R T:  F U N C T I O N S
import UserModel from "../models/userModel.js";
import NotificationModel from "../models/notificationModel.js";
import ProjectModel from "../models/projectModel.js"
import MessageModel from "../models/messageModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue";
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

//  L E G E N D
//  (N) = CONTROLLER WITH A NOTIFICATION

// ALL USERS (GET) 
export async function search(req, res, next) {
  try {
    const searchInput = req.body.searchInput
    const talentSearchFN = await UserModel.find({"profile.firstName": {$regex: `${searchInput}`, $options: 'i'}});
    const talentSearchLN = await UserModel.find({"profile.lastName": {$regex: `${searchInput}`, $options: 'i'}});
    const talentSearch = [...talentSearchFN, ...talentSearchLN]

    const projectSearchN = await ProjectModel.find({
      "name": {$regex: searchInput, $options: 'i'}});
    const projectSearchD = await ProjectModel.find({
      "description": {$regex: searchInput, $options: 'i'}});
    const projectSearch = [...projectSearchN, projectSearchD]

    res.json({
      status: true,
      talentSearch: talentSearch,
      projectSearch: projectSearch
    });
  } catch (err) {
    next(err);
  }
}

