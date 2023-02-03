// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import sgMail from '@sendgrid/mail';

// I M P O R T:  F U N C T I O N S
import ProjectModel from '../models/projectModel.js';
import UserModel from "../models/userModel.js";
import StoneModel from "../models/stoneModel.js";
import NotificationModel from "../models/notificationModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y 
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue"
const SENDGRID_KEY = process.env.SENDGRID_API_KEY 
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL;
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

// ALL PROJECTS (GET)
export async function getProjects(req, res, next) {
  try {
    res.json(await ProjectModel.find().populate(["team", "stones"]));
  }catch (err) {
    next(err);
  }
}

// CREATE PROJECT (POST)
export async function addProject(req, res, next) {
  try {
    // TAKE USERID
    const userId = req.body.userId;
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;

    // TAKE PROJECT DATA
    const projectData = req.body;
    const teamMemberIds = projectData.team;

    // CREATE NEW PROJECT
    const newProject = await ProjectModel.create(projectData);
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
    filteredMemberIds.map(async (member) => await UserModel.findByIdAndUpdate(member, {$push: {notifications: newNotification._id}}));

    // INVITE EMAIL IMPLEMENT BEGIN //
    const usersToInvite = newProject.inviteOthers;
    sgMail.setApiKey(SENDGRID_KEY)
    usersToInvite.map(async (member) => { 
      const msg = {
        to: member, // Change to your recipient
        from: SENDGRID_EMAIL, // Change to your verified sender
        subject: "INVITATION to 'improof'",
        // text: `To verify your email, please click on this link: http://localhost:2404/users/verify/${verifyToken}`,
        html: `
        <div>
        <p>Hi, </p>

        <p>${user.profile.firstName + " " + user.profile.lastName} invited you to join the 'improof-community'.</p>

        <p style="background-color: orange; border-radius: 7px; width: 120px; height: 30px; text-decoration: none;">
        Please register here
        <a href="${FE_HOST}/register">
        Register</a></p>      

        <p>and contact <a href="${FE_HOST}/myprofile/${user._id}">
        ${user.profile.firstName + " " + user.profile.lastName}</a></p>
      
        <p>Your 'improof' Team </p>
        
        <div>`,
      }
      const response = await sgMail.send(msg);    
    })
    // INVITE EMAIL IMPLEMENT END //

    // CLEAR INVITEOTHERS FROM PROJECT
    await ProjectModel.findByIdAndUpdate(projectId, {...newProject, inviteOthers: newProject.inviteOthers.length = 0});

    res.status(201).json({
      message: "Project SUCCESSFULLY added!", 
      status: true,
      data: newProject
    })
    } catch (err) {
      next(err);
    }
}

// GET A PROJECT (GET)
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
    // DEFINE NEEDED VARIABLES START//
    // TAKE USERID
    const userId = req.body.userId
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;

    // TAKE PROJECT DATA
    const newData = req.body;
    const projectId = req.params.id
    const project = await ProjectModel.findById(projectId);
    const projectMembers = project.team;
    let oldProjectData = await ProjectModel.findById(projectId);
    // DEFINE NEEDED VARIABLES END //

    // IMPORTANT: A additionally check (after auth) if the given id is identic to one of them in the project. We do that, because we want that the user could only change projects on which he is involved.
    
    // CHECK IF AUTHORIZED (PROJECT IN USER) START //
    if (!(projectMembers.includes(userId))) {
      const err = new Error("Not Authorized to UPDATE the Project!");
      err.statusCode = 401;
      throw err;
    }
    // CHECK IF AUTHORIZED (PROJECT IN USER) END //
    
    // ## CHECK & UPDATE EVERY GIVEN PARAMETER START ## //
    // CHECK NAME START //
    if(newData.name) {
      const newName = newData.name;
      const project = await ProjectModel.findByIdAndUpdate(projectId, 
        {name: newName}, {new: true});
      oldProjectData = project;
    } 
    // CHECK NAME END //

    // CHECK DESCRIPTION START //
    if(newData.description) {
      const newDescription = newData.description;
      const project = await ProjectModel.findByIdAndUpdate(projectId, 
        {description: newDescription}, {new: true});
      oldProjectData = project;
    } 
    // CHECK DESCRIPTION END //

    // CHECK THUMBNAIL START //
    if (req.file) {
      await ProjectModel.findByIdAndUpdate(projectId, 
        {thumbnail: `${BE_HOST}/${req.file.path}`}, {new: true});
        oldProjectData = project;
    }
    // CHECK THUMBNAIL END //

    // CHECK COLOR START //
    if(newData.color) {
      const newColor = newData.color;
      const project = await ProjectModel.findByIdAndUpdate(projectId, 
        {color: newColor}, {new: true});
      oldProjectData = project;
    }
    // CHECK COLOR END //

    // CHECK CATEGORY START //
    if(newData.category) {
      const newCategory = newData.category;
      const project = await ProjectModel.findByIdAndUpdate(projectId, 
        {category: newCategory}, {new: true});
      oldProjectData = project;
    }
    // CHECK CATEGORY END //

    // CHECK TEAM START //
    if(newData.team) {
      const newTeam = newData.team;
      const oldTeam = oldProjectData.team;
      const checkNewMembers = newTeam.filter((member) => !(oldTeam.includes(member)));
      if(checkNewMembers.length > 0) {
        const newNotification = await NotificationModel.create({
          receiver: checkNewMembers,
          notText: `${userName} added you to the team of the Project "${oldProjectData.name}"!`
        });
        checkNewMembers.map(async (member) => await UserModel.findByIdAndUpdate(member, {$push: {notifications: newNotification._id}}));
  
        const project = await ProjectModel.findByIdAndUpdate(projectId, 
          {team: newTeam}, {new: true});
        oldProjectData = project;
      }
    }
    // CHECK TEAM END //

    // CHECK INVITE OTHERS START //
    if(newData.inviteOthers && newData.inviteOthers.length > 0) {
      // INVITE EMAIL IMPLEMENT BEGIN //
      const usersToInvite = newData.inviteOthers;
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
    // INVITE EMAIL IMPLEMENT END //
    }
    // CHECK INVITE OTHERS END //

    // CHECK STONES BEGIN //
    // Stones will be created and edited on an other route with another controller!
    // CHECK STONES BEGIN //

    // ## CHECK & UPDATE EVERY GIVEN PARAMETER END ## //  

    const updatedProject = await ProjectModel.findById(projectId).populate(["team", "stones"]);
    res.status(200).json({
      message: 'Update was SUCCESSFUL!',
      status: true,
      data: updatedProject
    });
  }catch (err) {
    next(err);
  }
};

// DELETE PROJECT
export async function deleteProject(req, res, next) {
  try {
    // DEFINE NEEDED VARIABLES START//
    // TAKE USERID
    const userId = req.body.userId
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;

    // TAKE PROJECT DATA
    const projectId = req.params.id
    const oldProject = await ProjectModel.findById(projectId);
    const projectMembers = oldProject.team;
    // DEFINE NEEDED VARIABLES END //

    // IMPORTANT: A additionally check (after auth) if the given id is identic to one of them in the project. We do that, because we want that the user could only delete projects on which he is involved.

    // CHECK IF AUTHORIZED (PROJECT IN USER) START //
    if (!(projectMembers.includes(userId))) {
      const err = new Error("Not Authorized to DELETE the Project!");
      err.statusCode = 401;
      throw err;
    }
    // CHECK IF AUTHORIZED (PROJECT IN USER) END //
    
    // CREATE NOTIFICATION FOR ALL PROJECT MEMBERS START //
    const newNotification = await NotificationModel.create({
      receiver: projectMembers,
      notText: `${userName} deleted the Project "${oldProject.name}"!`
    });
    projectMembers.map(async(member) => await UserModel.findByIdAndUpdate(member, {$push: {notifications: newNotification._id}}));
    // CREATE NOTIFICATION FOR ALL PROJECT MEMBERS END //

    const deletedProject = await ProjectModel.findByIdAndDelete(req.params.id).populate(["team", "stones"]);
    res.status(200).json({
      userData: deletedProject,
      message: 'Delete was SUCCESSFUL!',
      status: true,
      data: ""
    });
  }catch (err) {
    next(err);
  }
}

