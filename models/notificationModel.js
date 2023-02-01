// I M P O R T   D E P E N D E N C I E S
import {Schema, model} from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const notificationSchema = new Schema({
  receiverT: [{type: Schema.Types.ObjectId, ref: "Talent"}],
  receiverR: [{type: Schema.Types.ObjectId, ref: "Recruiter"}],
  notText: {type: String}
}
, 
{strictQuery: true},
{timeStamps: true});

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const NotificationModel = model('Notification', notificationSchema, 'notifications');
export default NotificationModel;