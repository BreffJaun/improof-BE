// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// I M P O R T:  F U N C T I O N S
import MessageModel from "../models/messageModel.js";
import ConversationModel from "../models/conversationModel.js";

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
    console.log(allMessages);
    // console.log(conversation);
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
    const token = req.cookies.loginCookie;
    const tokenDecoded = jwt.verify(token, JWT_KEY);
    const userId = tokenDecoded.userId;

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
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    // const pushInConversation = await ConversationModel.findByIdAndUpdate(
    //   {conversationId },
    //   { $push: { message: updatedMessage } }
    // );

    res.status(201).json({
      message: "message edited successfully",
      status: true,
      data: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
}

// Delete Message
export async function deleteMessage(req, res, next) {
  try {
    const conversationId = req.body.conversationId;
    await MessageModel.findByIdAndDelete(req.params.id);
    await ConversationModel.findById(conversationId, {
      $pull: { message: req.params.id },
    });
    res.status(201).send({
      message: "message deleted successfully ",
      status: true,
      data: "",
    });
  } catch (error) {
    next(error);
  }
}
