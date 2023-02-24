// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import mongoose from "mongoose";
import express from 'express';

// I M P O R T:  F U N C T I O N S

// I M P O R T:  C O N T R O L L E R
import {
  increaseCounter
} from '../controller/countersController.js';

// ========================

// C R E A T E   R O U T E S
const router = express.Router();

router
  .route('/')
    .patch(increaseCounter);

export default router;