import * as dotenv from "dotenv";
dotenv.config();

// I M P O R T:  F U N C T I O N S
import StoneModel from "../models/stoneModel.js";
import ProjectModel from "../models/projectModel.js";
import NotificationModel from "../models/notificationModel.js";
import UserModel from "../models/userModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;

//========================

// Get all the stones of one project
export async function getStones(req, res, next) {
  try {
    const projectId = req.body.projectId;
    const project = await ProjectModel.findById(projectId).populate("stones");
    const allStones = project.stones;
    res.status(200).json({
      message: "All stones SUCCESS!",
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
      message: "A specific stone SUCCESS!",
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
    const newStoneData = JSON.parse(req.body.data)
    const projectId = newStoneData.projectId
    console.log("projectId: ", projectId);
    const project = await ProjectModel.findById(projectId);
    const userId = newStoneData.userId;
    console.log("userId: ", userId);
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;
    const team = project.team; // Project Team for notification push
    const restOfTheTeam = team.filter((member) => member.toString() !== userId);

    if (!team.includes(userId)) {
      const error = new Error(
        "You are not an authorized user to add a new stone to this project "
      );
      error.statusCode = 401;
      throw error;
    }
    const newStone = await StoneModel.create(newStoneData);

    // CHECK MEDIA START //
    if (req.file) {
      await ProjectModel.findByIdAndUpdate(
        projectId,
        { media: `${BE_HOST}/media/${req.file.id}` },
        { new: true }
      );
    }
    // else {
    //   await ProjectModel.findByIdAndUpdate(
    //     projectId,
    //     { media: `${BE_HOST}/media/63eb4e30424b07fc2e90d5b1` },
    //     { new: true }
    //   );
    // }
    // CHECK MEDIA END //

    const pushIntoProject = await ProjectModel.findByIdAndUpdate(projectId, {
      $push: { stones: newStone._id },
    });

    restOfTheTeam.map(async (member) => {
      const notification = await NotificationModel.create({
        receiver: member,
        notText:
          newStone.kind === "stepstone"
            ? `${userName} added a new stepstone to your ~${project.name}~ project`
            : newStone.kind === "milestone"
            ? `${userName} added a new milestone to your ~${project.name}~ project`
            : `** ${userName} added the endstone to your ~${project.name}~ project **`,
      });
      await UserModel.findByIdAndUpdate(member, {
        $push: { notifications: notification._id },
      });
    });

    res.status(201).json({
      message: "new stone added",
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
    console.log("Team: ", team);
    const restOfTheTeam = team.filter((member) => member.toString() !== userId);

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
      restOfTheTeam.map(async (member) => {
        const notification = await NotificationModel.create({
          receiver: member,
          notText:
            editedStone.kind === "stepstone"
              ? `${userName} edited a stepstone in your ~${project.name}~ project`
              : editedStone.kind === "milestone"
              ? `${userName} edited a milestone in your ~${project.name}~ project`
              : `${userName} edited the endstone of your ~${project.name}~ project`,
        });
        await UserModel.findByIdAndUpdate(member, {
          $push: { notifications: notification._id },
        });
      });
      res.status(201).json({
        message: "your stone is successfully updated",
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
    const restOfTheTeam = team.filter((member) => member.toString() !== userId);

    if (!team.includes(userId)) {
      const error = new Error(
        "You are not an authorized user to delete the stones of this stone "
      ).message;
      error.statusCode = 401;
      throw error;
    } else {
      const stoneToBeDeleted = await StoneModel.findById(req.params.id);
      const deleteStone = await StoneModel.findByIdAndDelete(req.params.id);
      // Delete  the reference from the project
      await ProjectModel.updateOne({
        $pull: {
          stones: req.params.id,
        },
      });
      restOfTheTeam.map(async (member) => {
        const notification = await NotificationModel.create({
          receiver: member,
          notText:
            stoneToBeDeleted.kind === "stepstone"
              ? `${userName} deleted a stepstone in your ~${project.name}~ project`
              : stoneToBeDeleted.kind === "milestone"
              ? `${userName} deleted a milestone in your ~${project.name}~ project`
              : `${userName} deleted the endstone of your ~${project.name}~ project`,
        });
        await UserModel.findByIdAndUpdate(member, {
          $push: { notifications: notification._id },
        });
      });
      res.status(201).json({
        message: "stone deleted",
        status: true,
        data: "",
      });
    }
  } catch (error) {
    next(error);
  }
}
