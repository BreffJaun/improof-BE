// I M P O R T   D E P E N D E N C I E S
import {Schema, model} from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const recruiterSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: false, unique: true},
  password: {type: String, required: true},
  avatar: {type: String},
  isRecruiter: {type: Boolean, default: true},
  isVerified: {type: Boolean, default: false},
  isVerifiedTCP: {type: Boolean, default: false}, // TCP = To Change Password;
  firstLogin: {type: Boolean, default: false}, // for the Congrats Component
  darkMode: {type: Boolean, default: false},
  colorTheme: {type: String, default: "bg-gPU"},
  follows: [{type: Schema.Types.ObjectId, ref: "Talent"}],
  starProjects: [{type: Schema.Types.ObjectId, ref: "Project"}],
  myProjects: [{type: Schema.Types.ObjectId, ref: "Project"}],

}

, 
{strictQuery: true});

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const RecruiterModel = model('Recruiter', recruiterSchema, 'recruiters');
export default RecruiterModel;