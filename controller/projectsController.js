// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sgMail from '@sendgrid/mail';

// I M P O R T:  F U N C T I O N S
import ProjectModel from '../models/projectModel.js';
import UserModel from "../models/userModel.js";

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
export async function getProject(req, res, next) {
  try {
    if (!(await ProjectModel.findById(req.params.id))){
      const err = new Error("No Project with this id in Database!");
      err.statusCode = 422;
      throw err; 
    } 
    const project = await ProjectModel.findById(req.params.id).populate(["Talent", "Stone"]);
    res.status(200).json({
      projectData: project,
      message: 'Search was SUCCESSFUL!',
      status: true,
      data: ""
    });
  }catch (err) {
    next(err);
  }
};

// UPDATE A PROJECT (PATCH)
export async function updateUser(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES //
    const projectData = req.body;
    const projectId = req.params.id
    let oldProjectData = await ProjectModel.findById(id);
    // DEFINE NEEDED VARIABLES //

    // IMPORTANT: A additionally check (after auth) if the given id is the same id as in the token. We do that, because we want that the user could only change his own projects.
    
    // CHECK IF AUTHORIZED (PROJECT IN USER) START //
    const check = await UserModel.findById(req.token.userId);
    
    if (id !== req.token.userId) {
      const err = new Error("Not Authorized!");
      err.statusCode = 401;
      throw err;
    }
    // CHECK IF AUTHORIZED (PROJECT IN USER) END //
    
    // ## CHECK & UPDATE EVERY GIVEN PARAMETER START ## //
    // ** UPDATE PROFILE START ** //
    // CHECK FIRSTNAME START //
    if(userData.profile.firstName) {
      const firstName = userData.profile.firstName;
      const lastName = oldUserData.profile.lastName;
      const initials = firstName[0].toUpperCase() + lastName[0].toUpperCase()
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, firstName: firstName, initials: initials}}, {new: true});
      oldUserData = user
    } 
    // CHECK FIRSTNAME END //

    // CHECK LASTNAME START //
    if(userData.lastName) {
      const firstName = oldUserData.profile.lastName;
      const lastName = userData.profile.lastName;
      const initials = firstName[0].toUpperCase() + lastName[0].toUpperCase()
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, lastName: lastName, initials: initials}}, {new: true});
      oldUserData = user
    } 
    // CHECK LASTNAME END //

    // CHECK EMAIL START //
    if(userData.profile.email) {
      const email = userData.profile.email;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, email: email}}, {new: true});
      oldUserData = user
      // ALTERNATIVE VERSION - PLEASE CHECKOUT ! ! !
      // const userFromDb = await UserModel.find(
      //   {email: userData.email}, 
      //   {id: {$not: req.params.id}
      // });
      // console.log(userFromDb);
      // if(userFromDb.length > 0) {
      //   const err = new Error("There is already a user with this email!");
      //   err.statusCode = 401;
      //   throw err; 
      // } else {
      //   const newEmail = userData.email;
      //   const updatedUser = await UserModel.findByIdAndUpdate(id, {email: newEmail, new: true});
      // }
    }
    // CHECK EMAIL END //
    
    // CHECK PASSWORD START //
    if(userData.profile.password) {
      const hashedPassword = await bcrypt.hash(userData.profile.password, 10);
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, password: hashedPassword}}, {new: true});
      oldUserData = user
    } 
    // CHECK PASSWORD END //

    // CHECK AVATAR BEGIN //
    if(req.file) {
      await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, avatar: `${BE_HOST}/${req.file.path}`}}, {new: true});
      oldUserData = user
    }
    // CHECK AVATAR END //

    // CHECK DESCRIPTION START //
    if(userData.profile.description) {
      const description = userData.profile.description;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, description: description}}, {new: true});
      oldUserData = user
    } 
    // CHECK DESCRIPTION END //

    // CHECK GOAL START //
    if(userData.profile.goal) {
      const goal = userData.profile.goal;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, goal: goal}}, {new: true});
      oldUserData = user
    } 
    // CHECK GOAL END //

    // CHECK POSITION START //
    if(userData.profile.position) {
      const position = userData.profile.position;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, position: position}}, {new: true});
      oldUserData = user
    } 
    // CHECK POSITION END //

    // CHECK TOOLSANDSKILLS START //
    if(userData.profile.toolsAndSkills) {
      const toolsAndSkills = userData.profile.toolsAndSkills;
      const user = await UserModel.findByIdAndUpdate(id, 
        {profile: {...oldUserData.profile, toolsAndSkills: toolsAndSkills}}, {new: true});
      oldUserData = user
    } 
    // CHECK TOOLSANDSKILLS END //
    // ** UPDATE PROFILE END ** //

    // ** UPDATE CONTACT START ** //
    // CHECK MOBILE START //
    if(userData.contact.mobile) {
      const mobile = userData.contact.mobile;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {...oldUserData.contact, mobile: mobile}}, {new: true});
      oldUserData = user
    } 
    // CHECK MOBILE END //

    // CHECK WEBSITE START //
    if(userData.contact.website) {
      const website = userData.contact.website;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {...oldUserData.contact, website: website}}, {new: true});
      oldUserData = user
    } 
    // CHECK WEBSITE END //

    // CHECK ONLINE1 START //
    if(userData.contact.online1) {
      const online1 = userData.contact.online1;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {...oldUserData.contact, online1: online1}}, {new: true});
      oldUserData = user
    } 
    // CHECK ONLINE1 END //

    // CHECK ONLINE2 START //
    if(userData.contact.online2) {
      const online2 = userData.contact.online2;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {...oldUserData.contact, online2: online2}}, {new: true});
      oldUserData = user
    } 
    // CHECK ONLINE2 END //

    // CHECK ONLINE3 START //
    if(userData.contact.online3) {
      const online3 = userData.contact.online3;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {...oldUserData.contact, online3: online3}}, {new: true});
      oldUserData = user
    } 
    // CHECK ONLINE3 END //

    // CHECK COMPANY START //
    if(userData.contact.company) {
      const company = userData.contact.company;
      const user = await UserModel.findByIdAndUpdate(id, 
        {contact: {...oldUserData.contact, company: company}}, {new: true});
      oldUserData = user
    } 
    // CHECK COMPANY END //
    // ** UPDATE CONTACT END ** //

    // ** UPDATE LOCATION START ** //
    // CHECK STREET START //
    if(userData.location.street) {
      const street = userData.location.street;
      const user = await UserModel.findByIdAndUpdate(id, 
        {location: {...oldUserData.location, street: street}}, {new: true});
      oldUserData = user
    } 
    // CHECK STREET END //

    // CHECK ZIP START //
    // console.log('userData.location.zip', userData.location.zip);
    if (userData.location.zip) {
      const zip = userData.location.zip;
      const user = await UserModel.findByIdAndUpdate(id,
        {location: {...oldUserData.location, zip: zip}}, {new: true});
      oldUserData = user
    };
    // CHECK ZIP END //

    // CHECK CITY START //
    if(userData.location.city) {
      const city = userData.location.city;
      const user = await UserModel.findByIdAndUpdate(id, 
        {location: {...oldUserData.location, city: city}}, {new: true});
      oldUserData = user
    } 
    // CHECK CITY END //
    // ** UPDATE LOCATION END ** //

    // ** UPDATE META START ** //
    // CHECK DARKMODE START //
    if(userData.meta.darkMode) {
      const darkMode = userData.location.darkMode;
      const user = await UserModel.findByIdAndUpdate(id, 
        {meta: {...oldUserData.meta, darkMode: darkMode}}, {new: true});
      oldUserData = user
    }
    // CHECK DARKMODE END //

    // CHECK COLORTHEME START //
    if(userData.meta.colorTheme) {
      const colorTheme = userData.location.colorTheme;
      const user = await UserModel.findByIdAndUpdate(id, 
        {meta: {...oldUserData.meta, colorTheme: colorTheme}}, {new: true});
      oldUserData = user
    }
    // CHECK COLORTHEME END //
    // ** UPDATE META END ** //
    // ## CHECK & UPDATE EVERY GIVEN PARAMETER END ## //    
    const updatedUser = await UserModel.findById(id);
    res.status(200).json({
      userData: updatedUser,
      message: 'Update was SUCCESSFUL!',
      status: true,
      data: ""
    });
  }catch (err) {
    next(err);
  }
};
