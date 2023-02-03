// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// I M P O R T:  F U N C T I O N S
import MessageModel from "../models/messageModel.js";
import ConversationModel from "../models/conversationModel.js";
import UserModel from "../models/userModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue";

//========================

// GET all messages

export async function messagesGetAll(req, res, next) {
  try {
    const conversationId = req.body.conversationId;
    const conversation = await ConversationModel.findById(
      conversationId
    ).populate("message");
    const allMessages = conversation.message;
    res.json({
      message: allMessages,
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}

export async function addMessage(req, res, next) {
  try {
    // TAKE USERID
    const userId = req.body.userId;

    // TAKE CONVERSATIONID
    const conversationId = req.body.conversationId;

    //MESSAGE
    const message = req.body.text;
    const newMessage = await MessageModel.create({
      from: userId,
      text: message,
    });
    const pushInConversation = await ConversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { message: newMessage._id } }
    );
    res.status(201).send({
      message: "new message sent",
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}

// Update Message
export async function updateMessage(req, res, next) {
  try {
    // const conversationId=req.body.conversationId;
    const userId = req.body.userId;
    const sender = await MessageModel.findById(req.params.id);
    // nur der ersteller kann seine Nachricht lösen
    if (sender.from.toString() === userId) {
      const updatedMessage = await MessageModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      res.status(201).json({
        message: "message edited successfully",
        status: true,
        data: updatedMessage,
      });
    } else {
      res.status(403).send({
        message: "you are not allowed to edit or delete this message",
        status: false,
        data: "",
      });
    }
  } catch (error) {
    next(error);
  }
}

// Delete Message
export async function deleteMessage(req, res, next) {
  try {
    const conversationId = req.body.conversationId;

    const userId = req.body.userId;
    const sender = await MessageModel.findById(req.params.id);
    // nur der ersteller kann sein Nachricht lösen
    if (sender.from.toString() === userId) {
      await MessageModel.findByIdAndDelete(req.params.id);
      await ConversationModel.findById(conversationId).updateOne({
        $pull: {
          message: req.params.id,
        },
      });
      const conversation = await ConversationModel.findById(conversationId);
      if (conversation.message.length === 0) {
        await ConversationModel.findByIdAndDelete(conversationId);
        await UserModel.find({ conversations: conversationId }).updateMany({
          $pull: { conversations: conversationId },
        });
      }
      console.log("message length" + conversation.message.length);
      res.status(201).send({
        message: "message deleted successfully ",
        status: true,
        data: "",
      });
    } else {
      res.status(403).send({
        message: "you are not allowed to edit or delete this message",
        status: false,
        data: "",
      });
    }
  } catch (error) {
    next(error);
  }
}
