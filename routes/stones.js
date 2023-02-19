// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from "express";

// I M P O R T:  F I L E S   &   F U N C T I O N S
import { upload } from "./medias.js";

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

router
  .route("/").get(getStones).post(upload.single("media"), addStone);

router
  .route("/:stoneId")
    .get(getOneStone)
    .patch(upload.single("media"), updateStone)
    .delete(deleteStone);


export default router;
