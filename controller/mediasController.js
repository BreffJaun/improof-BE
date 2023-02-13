// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import {MongoClient, ObjectId} from 'mongodb';
import { gridBucket } from "../server.js";

// I M P O R T:  F U N C T I O N S


// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y

//========================

//  L E G E N D
//  (N) = CONTROLLER WITH A NOTIFICATION


// GET MEDIA (GET) 
export async function getMedia(req, res, next) {
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
  } catch (err) {
    next(err);
  }
};

