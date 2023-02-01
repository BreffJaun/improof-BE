// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sgMail from '@sendgrid/mail';

// I M P O R T:  F U N C T I O N S
import ProjectModel from '../models/projectModel.js';

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y 
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue"
const SENDGRID_KEY = process.env.SENDGRID_API_KEY 
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

// ALL PROJECTS (GET)
export async function getProjects (req, res, next) {
  try {
    res.json(await ProjectModel.find());
  }catch (err) {
    next(err);
  }
}

// ADD PROJECT (POST)
export async function addProject (req, res, next) {
  try {
    const projectData = req.body;
    const newProject = await ProjectModel.create(projectData).populate(["Talent", "Stone"]);
    res.status(201).json({
      message: "Project SUCCESSFULLY added!", 
      status: true,
      data: ""
    })
    } catch (err) {
      next(err);
    }
}

// GET A PROJECT
