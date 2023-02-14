// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import express from 'express';

// I M P O R T:  F U N C T I O N S

// I M P O R T:  C O N T R O L L E R
import {
  search
} from '../controller/searchController.js';

import { auth } from '../middleware/auth.js';

// ========================

// C R E A T E   R O U T E S
const Router = express.Router();

Router
  .route('/')
    .post(search)


export default Router;
