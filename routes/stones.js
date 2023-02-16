// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from "express";

// I M P O R T:  C O N T R O L L E R
import {
  getStones,
  getOneStone,
  addStone,
  updateStone,
  deleteStone,
} from "../controller/stonesController.js";

// C R E A T E   R O U T E S
const router = express.Router();

router.route("/").get(getStones).post(addStone);

router.route("/:stoneId").get(getOneStone).delete(deleteStone);

router.route("/:projectId/:stoneId").patch(updateStone);

export default router;
