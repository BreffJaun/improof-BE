// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import express from 'express';
import multer from 'multer';

// I M P O R T:  F U N C T I O N S
import {validateRequest} from '../middleware/validator.js'
import { 
  userValidator
  // , 
  // userUpdateValidator 
} from '../middleware/userValidator.js';

// I M P O R T:  C O N T R O L L E R
import {
  addUser, 
  getUsers, 
  getUser,
  updateUser, 
  deleteUser,
  login,
  checkLogin,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  setNewPassword
} from '../controller/usersController.js';

import { auth } from '../middleware/auth.js';

// ========================

// D E F I N E   M U L T E R   I N S T A N C E
const upload = multer({dest: "uploads/"});

// C R E A T E   R O U T E S
const router = express.Router();

router
  .route('/add')
    .get( getUsers)
    .post(userValidator, validateRequest, addUser);

router
  .route('/verify/:token')
    .get(verifyEmail)
    
router
  .route('/login')
    .post(login)

router
  .route('/checklogin')
    .get(checkLogin)

router
  .route('/forgotpassword')
    .post(forgotPassword)

router
  .route("/reset/:token")
    .get(verifyResetToken);

router
  .route('/setnewpassword')
    .post(setNewPassword)

router
  .route('/:id')
    .get(auth, getUser)
    .patch(userValidator, validateRequest,  updateUser)
    .delete(auth, deleteUser);


export default router;
