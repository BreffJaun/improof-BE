// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from 'express';
import multer from 'multer';

// I M P O R T:  F U N C T I O N S
import {validateRequest} from '../middleware/validator.js'
import { 
  projectValidator
} from '../middleware/projectValidator.js';

// I M P O R T:  C O N T R O L L E R
import {
  getProjects,
  addProject,
  getProject,
  updateProject,
  deleteProject
} from '../controller/projectsController.js';

import { auth } from '../middleware/auth.js';

// ========================

// D E F I N E   M U L T E R   I N S T A N C E
const upload = multer({dest: "uploads/"});

// C R E A T E   R O U T E S
const router = express.Router();

router
  .route('/')
    .get(getProjects)

router
  .route('/add')
    .post(projectValidator, validateRequest, addProject);

router
  .route('/:id')
    .get(getProject)
    .patch(updateProject)
    .delete(deleteProject)


export default router;
