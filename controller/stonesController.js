import * as dotenv from "dotenv";
dotenv.config();

// I M P O R T:  F U N C T I O N S
import StoneModel from "../models/stoneModel.js";
import ProjectModel from "../models/projectModel.js";
import NotificationModel from "../models/notificationModel.js";
import UserModel from "../models/userModel.js";

//========================

// Get all the stones of one project
export async function getStones(req, res, next) {
  try {
    const projectId = req.body.projectId;
    const project = await ProjectModel.findById(projectId).populate("stones");
    const allStones = project.stones;
    res.status(200).json({
      message: allStones,
      status: true,
      data: allStones,
    });
  } catch (error) {
    next(error);
  }
}

// Get a specific stone of a project
export async function getOneStone(req, res, next) {
  try {
    // const projectId = req.body.projectId;
    // const project = await ProjectModel.findById(projectId).populate("stones");
    const stoneId = req.params.stoneId;
    const stone = await StoneModel.findById(stoneId).populate("contributors");
    res.status(200).json({
      message: stone,
      status: true,
      data: stone,
    });
  } catch (error) {
    next(error);
  }
}

// Add a new stone in a project
export async function addStone(req, res, next) {
  try {
    const projectId = req.body.projectId;
    const project = await ProjectModel.findById(projectId);
    const userId = req.body.userId;
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;
    const team = project.team;

    if (!team.includes(userId)) {
      const error = new Error(
        "You are not an authorized user to add a new stone to this project "
      );
      error.statusCode = 401;
      throw error;
    }
    const newStone = await StoneModel.create(req.body);
    const pushIntoProject = await ProjectModel.findByIdAndUpdate(projectId, {
      $push: { stones: newStone._id },
    });

    const notification = await NotificationModel.create({
      receiver: team,
      notText:
        newStone.kind === "stepstone"
          ? `${userName} added a new stepstone to your ~${project.name}~ project`
          : newStone.kind === "milestone"
          ? `${userName} added a new milestone to your ~${project.name}~ project`
          : `** ${userName} added the endstone to your ~${project.name}~ project **`,
    });
    const notMessage = 41 + project.name.length + userName.length;
    res.status(201).json({
      message: notification.notText.slice(-notMessage),
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}

// Edit an existed stone inside a project
export async function updateStone(req, res, next) {
  try {
    const projectId = req.body.projectId;
    const project = await ProjectModel.findById(projectId);
    const userId = req.body.userId;
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;
    const team = project.team;
    const restOfTheTeam = team.filter((member) => member !== userId);
    
    if (!team.includes(userId)) {
      const error = new Error(
        "You are not an authorized user to edit the stones of this project "
      ).message;
      error.statusCode = 401;
      throw error;
    } else {
      const editedStone = await StoneModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      const notification = await NotificationModel.create({
        receiver: restOfTheTeam,
        notText:
          editedStone.kind === "stepstone"
            ? `${userName} edited a stepstone in your ~${project.name}~ project`
            : editedStone.kind === "milestone"
            ? `${userName} edited a milestone in your ~${project.name}~ project`
            : `${userName} edited the endstone of your ~${project.name}~ project`,
      });
      console.log('Rest of the team: ', restOfTheTeam);
      restOfTheTeam.map(
        async (member) =>
          await UserModel.findByIdAndUpdate(member, {
            $push: { notifications: notification._id },
          })
      );
      const notMessage = 38 + project.name.length + userName.length;
      res.status(201).json({
        message: notification.notText.slice(-notMessage),
        status: true,
        data: editedStone,
      });
    }
  } catch (error) {}
}
export async function deleteStone(req, res, next) {
  try {
    const projectId = req.body.projectId;
    const project = await ProjectModel.findById(projectId);
    const userId = req.body.userId;
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;
    const team = project.team;
    const restOfTheTeam = team.filter((member) => member === userId);

    if (!team.includes(userId)) {
      const error = new Error(
        "You are not an authorized user to delete the stones of this stone "
      ).message;
      error.statusCode = 401;
      throw error;
    } else {
      const stoneToBeDeleted = await StoneModel.findById(req.params.id);
      const notification = await NotificationModel.create({
        receiver: restOfTheTeam,
        notText:
          stoneToBeDeleted.kind === "stepstone"
            ? `${userName} deleted a stepstone in your ~${project.name}~ project`
            : stoneToBeDeleted.kind === "milestone"
            ? `${userName} deleted a milestone in your ~${project.name}~ project`
            : `${userName} deleted the endstone of your ~${project.name}~ project`,
      });
      const deleteStone = await StoneModel.findByIdAndDelete(req.params.id);
      // Delete  the reference from the project
      await project.updateOne({
        $pull: {
          stones: req.params.id,
        },
      });
      restOfTheTeam.map(
        async (member) =>
          await UserModel.findByIdAndUpdate(member, {
            $push: { notifications: notification._id },
          })
      );
      const notMessage = 39 + project.name.length + userName.length;
      res.status(201).json({
        message: notification.notText.slice(-notMessage),
        status: true,
        data: "",
      });
    }
  } catch (error) {
    next(error);
  }
}
