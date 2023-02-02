// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sgMail from '@sendgrid/mail';

// I M P O R T:  F U N C T I O N S
import ProjectModel from '../models/projectModel.js';
import UserModel from "../models/userModel.js";
import NotificationModel from "../models/notificationModel.js";

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

// CREATE PROJECT (POST)
export async function addProject (req, res, next) {
  try {
    // TAKE USERID
    const token = req.cookies.loginCookie;
    const tokenDecoded = jwt.verify(token, JWT_KEY);
    const userId = tokenDecoded.userId;
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;

    // TAKE PROJECT DATA
    const projectData = req.body;
    const teamMemberIds = projectData.team;

    // CREATE NEW PROJECT
    const newProject = await ProjectModel.create(projectData).populate(["team", "stones"]);
    const projectId = newProject._id;

    // AVATAR IMPLEMENT BEGIN //
    if (req.file) {
      await ProjectModel.findByIdAndUpdate(projectId, {
        thumbnail: `${BE_HOST}/${req.file.path}`,
      });
    } else {
      await ProjectModel.findByIdAndUpdate(projectId, {
        thumbnail: `${BE_HOST}/assets/images/coffypaste_icon_avatar.png`,
      });
    }
    // AVATAR IMPLEMENT END //

    // ADD PROJECT TO EVERY TEAMMEMBER
    await teamMemberIds.map((member) => UserModel.findByIdAndUpdate(member, {$push: {myProjects: newProject._id}}));

    // CREATE NOTIFICATION FOR THE NON CREATOR MEMBERS
    const filteredMemberIds = teamMemberIds.filter((member) => member === userId);
    const newNotification = await NotificationModel.create({
      receiver: filteredMemberIds,
      notText: `${userName} created a new Project and added you to the team!`
    });
    await filteredMemberIds.map((member) => UserModel.findByIdAndUpdate(member, {$push: {notifications: newNotification._id}}));

    // VERIFY EMAIL IMPLEMENT BEGIN //
    const usersToInvite = newProject.inviteOthers;
    sgMail.setApiKey(SENDGRID_KEY)
    const msg = {
      bcc: usersToInvite, // Change to your recipient
      from: SENDGRID_EMAIL, // Change to your verified sender
      subject: "INVITATION to your 'improof' account",
      // text: `To verify your email, please click on this link: http://localhost:2404/users/verify/${verifyToken}`,
      html: `
      <div>
      <p>Hi, </p>

      <p>${user.profile.firstName + " " + user.profile.lastName} invited you to join the 'improof-community'.</p>

      <p style="background-color: orange; border-radius: 7px; width: 80px; height: 20px; text-decoration: none;">
      Please register here
      <a href="${FE_HOST}/register">
      Register</a></p>      

      <p>and contact <a href="${FE_HOST}/myprofile/${user._id}">
      ${user.profile.firstName + " " + user.profile.lastName}</a></p>
    
      <p>Your 'improof' Team </p>
      
      <div>`,
    }
    const response = await sgMail.send(msg);
    // VERIFY EMAIL IMPLEMENT END //

    // CLEAR INVITEOTHERS FROM PROJECT
    await ProjectModel.findByIdAndUpdate(projectId, {...newProject, inviteOthers: []});

    res.status(201).json({
      message: "Project SUCCESSFULLY added!", 
      status: true,
      data: newProject
    })
    } catch (err) {
      next(err);
    }
}

// GET A PROJECT
export async function getProject(req, res, next) {
  try {
    const projectId = req.params.id
    if (!(await ProjectModel.findById(projectId))){
      const err = new Error("No Project with this id in Database!");
      err.statusCode = 422;
      throw err; 
    } 
    const project = await ProjectModel.findById(projectId).populate(["team", "stones"]);
    res.status(200).json({
      message: 'Search was SUCCESSFUL!',
      status: true,
      data: project
    });
  }catch (err) {
    next(err);
  }
};

// UPDATE A PROJECT (PATCH)
export async function updateProject(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES //
    // TAKE USERID
    const token = req.cookies.loginCookie;
    const tokenDecoded = jwt.verify(token, JWT_KEY);
    const userId = tokenDecoded.userId;
    const user = await UserModel.findById(userId);

    // TAKE PROJECT DATA
    const projectId = req.params.id
    const projectData = req.body;
    let oldProjectData = await ProjectModel.findById(projectId);
    // DEFINE NEEDED VARIABLES //

    // IMPORTANT: A additionally check (after auth) if the given id is the same id as in the token. We do that, because we want that the user could only change his own projects.
    
    // CHECK IF AUTHORIZED (PROJECT IN USER) START //
    // if(await ProjectModel.findById(projectId, {userId: {$in: {"team"}}})) {

    // }
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
