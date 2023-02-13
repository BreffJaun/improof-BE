// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import mongoose from "mongoose";
import express from 'express';
import multer from 'multer';
import {GridFsStorage} from "multer-gridfs-storage";
// import ObjectId from 'mongodb'
import {MongoClient, ObjectId} from 'mongodb';
import { gridBucket } from "../server.js";

// I M P O R T:  F U N C T I O N S
import {validateRequest} from '../middleware/validator.js'
import { 
  userValidator
  // , 
  // userUpdateValidator 
} from '../middleware/userValidator.js';

// I M P O R T  &  D E C L A R E   C O N N E C T I O N   U R L   K E Y 
const DB_NAME = process.env.DB_NAME
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority` || "mongodb://localhost:27017"

// I M P O R T:  C O N T R O L L E R
import {
  addUser, 
  getUsers, 
  getUser,
  updateUser, 
  deleteUser,
  login,
  checkLogin,
  logout,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  followUser,
  leadUser,
  setNewPassword
} from '../controller/usersController.js';

import { auth } from '../middleware/auth.js';
import { Schema, model, get } from 'mongoose';

// ========================

// D E F I N E   G R I D F S   I N S T A N C E
// mongoose.set("strictQuery", false)
// const connection = mongoose.connect(url)

const bucket = "photos"
const storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    if(file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
    ){
      return {
        bucketName: bucket
      };
    } else {
      return null
    }
  }
});

const upload = multer({storage});

// D E F I N E   M U L T E R   I N S T A N C E
// const upload = multer({ dest: "uploads/" });

// C R E A T E   R O U T E S
const userRouter = express.Router();
const mediaRouter = express.Router();

mediaRouter
  .route('/:id')
    .get(getMedia);

// const photoSchema = new Schema (
//   {
//     length: Number,
//     chunkSize: Number,
//     uploadDate: Date,
//     fileName: String,
//     contentType: String
//   }
// )

// const PhotoModel = model("Photo", photoSchema, "photos.files");


async function getMedia(req, res, next) {
  try {
    const mediaId = req.params.id;
    console.log('mediaId: ', mediaId);
    const file = gridBucket.find().toArray((err, result) => {
      if(err) {
        res.send(err.message)
      } else {
        if(!result || result.length == 0) {
          console.log('result: ', result)
          res.send({message: "File does not exists"})
        } else {
          gridBucket.openDownloadStream(ObjectId(`${mediaId}`)).pipe(res)
        }
      }
    })
    // console.log('file: ', file);
    // const file = bucket.openDownloadStream(ObjectId(`${mediaId}`)).pipe(photos.createWriteStream('./outputFile'));
    // const file = await PhotoModel.findById(mediaId);
    // console.log(file);
    // res.status(200).send({
    //   status: true,
    //   data: file
    // })

  } catch (err) {
    next(err);
  }
};

userRouter
  .route('/')
    .get(getUsers)
userRouter
  .route('/add')
    .post(upload.single('avatar'), userValidator, validateRequest, addUser);

userRouter
  .route('/verify/:token')
    .get(verifyEmail)
    
userRouter
  .route('/login')
    .post(login)

userRouter
  .route('/checklogin')
    .get(checkLogin)

userRouter
  .route('/logout')
    .get(logout)

userRouter
  .route('/forgotpassword')
    .post(forgotPassword)

userRouter
  .route('/reset/:token')
    .get(verifyResetToken);
    
userRouter
  .route('/setnewpassword')
    .post(setNewPassword)
    
userRouter
  .route('/follow/add')
    .patch(auth, followUser)

userRouter
  .route('/follow/delete')
    .delete(auth, leadUser)

userRouter
  .route('/:id')
    .get(auth, getUser)
    .patch(upload.single('avatar'),auth, updateUser)
    .delete(auth, deleteUser);


export {userRouter, mediaRouter};
