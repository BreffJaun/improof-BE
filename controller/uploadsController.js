// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// I M P O R T:  F U N C T I O N S
import UserModel from "../models/userModel.js";
import NotificationModel from "../models/notificationModel.js";
import ProjectModel from "../models/projectModel.js"

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
export async function uploads(req, res, next) {
  try {
    res.sendFile(`${__dirname}/uploads/${req.params.id}`);
  } catch (err) {
    next(err);
  }
}
