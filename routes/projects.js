// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from "express";
import multer from "multer";

// I M P O R T:  F U N C T I O N S
import { validateRequest } from "../middleware/validator.js";
import { projectValidator } from "../middleware/projectValidator.js";
import { upload } from "./medias.js";

// I M P O R T:  C O N T R O L L E R
import {
  getProjects,
  addProject,
  followProject,
  leadProject,
  getProject,
  updateProject,
  deleteProject,
} from "../controller/projectsController.js";

import { auth } from "../middleware/auth.js";

// ========================

// C R E A T E   R O U T E S
const router = express.Router();

router.route("/").get(getProjects);

router.route("/add").post(upload.single('thumbnail'), addProject);

router.route("/follow/add").patch(auth, followProject);

router.route("/follow/delete").delete(auth, leadProject);

router
  .route("/:id")
  .get(auth, getProject)
  .patch(auth, updateProject)
  .delete(auth, deleteProject);

export default router;
