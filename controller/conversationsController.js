// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// I M P O R T:  F U N C T I O N S
import ConversationModel from "../models/conversationModel.js";
import UserModel from "../models/userModel.js";
import MessageModel from "../models/messageModel.js";

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const JWT_KEY = process.env.SECRET_JWT_KEY || "DefaultValue";

//========================

// GET ALL CONVERSATIONS

export async function conversationsGetAll(req, res, next) {
  try {
    // TAKE USERID
    const userId = req.body.userId;

    const user = await UserModel.findById(userId).populate("conversations");
    const allConversations = user.conversations;

    res.json({
      conversations: allConversations,
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}

// ADD NEW CONVERSATION
export async function addConversation(req, res, next) {
  try {
    // Get the participants of the conversation:
    // TAKE USERID - the sender of the message
    // const token = req.cookies.loginCookie;
    // const tokenDecoded = jwt.verify(token, JWT_KEY);
    const userId = req.body.userId;

    // TAKE RECEIVERID - the receiver of the message
    const receiverId = req.body.receiverId;

    const participants = [userId, receiverId];

    //CONVERSATION
    const message = await MessageModel.create({
      from: userId,
      text: req.body.message,
    });
    console.log(message);

    const newConversation = await ConversationModel.create({
      participants: participants,
      message: message._id,
    });

    const pushInSender = await UserModel.findByIdAndUpdate(userId, {
      $push: { conversations: newConversation._id },
    });
    const pushInReceiver = await UserModel.findByIdAndUpdate(receiverId, {
      $push: { conversations: newConversation._id },
    });
    res.status(201).send({
      message: "new conversation started",
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE CONVERSATION
export async function updateConversation(req, res, next) {
  try {
    const conversationId = req.body.conversationId;
    const updatedConversation = await ConversationModel.findByIdAndUpdate(
      conversationId,
      req.body,
      {
        new: true,
      }
    );

    res.status(201).json({
      message: "conversation updated successfully",
      status: true,
      data: updatedConversation,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE CONVERSATION
export async function deleteConversation(req, res, next) {
  try {
    // Get the participants of the conversation:
    // TAKE USERID - the sender of the message
    const token = req.cookies.loginCookie;
    const tokenDecoded = jwt.verify(token, JWT_KEY);
    const userId = tokenDecoded.userId;

    // TAKE RECEIVERID - the receiver of the message
    const receiverId = req.params.receiverId;

    const conversationId = req.body.conversationId;

    await ConversationModel.findByIdAndDelete(conversationId);
    await UserModel.findById(userId, {
      $pull: { conversations: conversationId },
    });
    await UserModel.findById(receiverId, {
      $pull: { conversations: conversationId },
    });

    res.status(201).send({
      message: "conversation successfully deleted",
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}
