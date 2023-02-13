// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from "express";

// I M P O R T:  C O N T R O L L E R
import {
  addMessage,
  messagesGetAll,
  updateMessage,
  deleteMessage,
} from "../controller/messagesController.js";

// C R E A T E   R O U T E S
const router = express.Router();

router.route("/").patch(messagesGetAll).post(addMessage);

router.route("/:id").delete(deleteMessage).patch(updateMessage);

export default router;
