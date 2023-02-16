// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import mongoose from "mongoose";
import express from 'express';
import multer from 'multer';
import {GridFsStorage} from "multer-gridfs-storage";

// I M P O R T:  F U N C T I O N S


// I M P O R T  &  D E C L A R E   C O N N E C T I O N   U R L   K E Y 
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority` || "mongodb://localhost:27017"

// I M P O R T:  C O N T R O L L E R
import {
  getMedia
} from '../controller/mediasController.js';


// ========================

// D E F I N E   G R I D F S   I N S T A N C E

// INSTANCE FOR PHOTOS
const storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    if(file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/tiff' ||
    file.mimetype === 'image/bmp'
    ){
      return {
        bucketName: "photos"
      };
    } else {
      return null
    }
  }
});

const upload = multer({storage});

// const videoStorage = new GridFsStorage({
//   url: url,
//   file: (req, file) => {
//     if(file.mimetype === 'video/mp4' ||
//     file.mimetype === 'video/mov' ||
//     file.mimetype === 'video/wmv' ||
//     file.mimetype === 'video/avi' ||
//     file.mimetype === 'video/mkv' ||
//     file.mimetype === 'video/flv'
//     ){
//       return {
//         bucketName: "videos"
//       };
//     } else {
//       return null
//     }
//   }
// });

// const videoUpload = multer({videoStorage});


// C R E A T E   R O U T E S
const mediaRouter = express.Router();

mediaRouter
  .route('/:id')
    .get(getMedia);

export {
  mediaRouter, 
  upload, 
  // videoUpload
};
