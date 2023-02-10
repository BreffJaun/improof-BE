// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from "express";

// I M P O R T:  C O N T R O L L E R
import {
  conversationsGetAll,
  addConversation,
  conversationsGetOne,
  // deleteConversation,
} from "../controller/conversationsController.js";

// C R E A T E   R O U T E S
const router = express.Router();

router.route("/").get(conversationsGetAll).post(addConversation);

router.route("/:id").get(conversationsGetOne);

// Eine Konversation wird automatisch gelöscht wenn die letze Nachricht gelöscht wird
// router.route("/:id").delete(deleteConversation);

export default router;
