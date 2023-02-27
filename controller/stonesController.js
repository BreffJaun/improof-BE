import * as dotenv from "dotenv";
dotenv.config();
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";

// I M P O R T:  F U N C T I O N S
import StoneModel from "../models/stoneModel.js";
import ProjectModel from "../models/projectModel.js";
import NotificationModel from "../models/notificationModel.js";
import UserModel from "../models/userModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const BE_HOST = process.env.BE_HOST;
const FE_HOST = process.env.FE_HOST;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

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
    // console.log(req.params);
    const stoneId = req.params.stoneId;
    const stone = await StoneModel.findById(stoneId).populate("team");
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
    const newStoneData = JSON.parse(req.body.data);
    const projectId = newStoneData.projectId;
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
    const newStoneId = newStone._id;

    // CHECK MEDIA START //
    if (req.file) {
      cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
      });
      console.log("req.file: ", req.file);
      const absFilePath = __dirname + "../" + req.file.path;
      const response = await cloudinary.uploader.upload(absFilePath, {
        resource_type: "auto",
        use_filename: true,
      });
      unlink(absFilePath);
      await StoneModel.findByIdAndUpdate(newStoneId, {
        media: response.secure_url,
        contentType: req.file.mimetype,
      });
    }
    // CHECK MEDIA END //

    const pushIntoProject = await ProjectModel.findByIdAndUpdate(projectId, {
      $push: { stones: newStoneId },
    });

    restOfTheTeam.map(async (member) => {
      const notification = await NotificationModel.create({
        receiver: member,
        notText:
          newStone.kind === "stepstone"
            ? `${userName} added a new stepstone to ${project.name}`
            : newStone.kind === "milestone"
            ? `${userName} added a new milestone to ${project.name}`
            : ` ${userName} added the endstone to ${project.name}`,
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
    const newStoneData = JSON.parse(req.body.data);
    console.log("newStoneData: ", newStoneData);
    const projectId = newStoneData.projectId;
    const stoneId = newStoneData.stoneId;
    const userId = newStoneData.userId;
    const project = await ProjectModel.findById(projectId);
    const stone = await StoneModel.findById(stoneId);
    const user = await UserModel.findById(userId);
    const userName = user.profile.firstName + " " + user.profile.lastName;
    const team = project.team;
    const restOfTheTeam = team.filter((member) => member.toString() !== userId);

    if (!team.includes(userId)) {
      const error = new Error(
        "You are not an authorized user to edit the stones of this project "
      ).message;
      error.statusCode = 401;
      throw error;
    } else {
      const editedStone = await StoneModel.findByIdAndUpdate(
        stoneId,
        newStoneData,
        { new: true }
      );

      // CHECK MEDIA START //
      if (req.file) {
        console.log("req.file: ", req.file);
        cloudinary.config({
          cloud_name: CLOUDINARY_CLOUD_NAME,
          api_key: CLOUDINARY_API_KEY,
          api_secret: CLOUDINARY_API_SECRET,
        });
        const absFilePath = __dirname + "../" + req.file.path;
        const response = await cloudinary.uploader.upload(absFilePath, {
          resource_type: "auto",
          use_filename: true,
        });
        unlink(absFilePath);
        await StoneModel.findByIdAndUpdate(stoneId, {
          media: response.secure_url,
          contentType: req.file.mimetype,
        });
      }
      // CHECK MEDIA END //

      restOfTheTeam.map(async (member) => {
        const notification = await NotificationModel.create({
          receiver: member,
          notText:
            editedStone.kind === "stepstone"
              ? `${userName} edited a stepstone in ${project.name}`
              : editedStone.kind === "milestone"
              ? `${userName} edited a milestone in ${project.name}`
              : `${userName} edited the endstone of ${project.name}`,
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
  } catch (error) {
    next();
  }
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
      const stoneToBeDeleted = await StoneModel.findById(req.params.stoneId);
      const deleteStone = await StoneModel.findByIdAndDelete(
        req.params.stoneId
      );
      // Delete  the reference from the project
      await ProjectModel.updateOne({
        $pull: {
          stones: req.params.stoneId,
        },
      });
      restOfTheTeam.map(async (member) => {
        const notification = await NotificationModel.create({
          receiver: member,
          notText:
            stoneToBeDeleted.kind === "stepstone"
              ? `${userName} deleted a stepstone in ${project.name}`
              : stoneToBeDeleted.kind === "milestone"
              ? `${userName} deleted a milestone in ${project.name}`
              : `${userName} deleted the endstone of ${project.name}`,
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
