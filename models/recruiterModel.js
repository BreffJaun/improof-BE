// I M P O R T   D E P E N D E N C I E S
import { Schema, model } from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const recruiterSchema = new Schema(
  {
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: false, unique: true },
      password: { type: String, required: true },
      avatar: { type: String },
      description: { type: String },
      position: { type: String },
      isRecruiter: { type: Boolean, default: true },
      initials: { type: string },
    },
    contact: {
      mobile: { type: String },
      website: { type: String },
      company: { type: String },
    },
    meta: {
      isVerified: { type: Boolean, default: false },
      isVerifiedTCP: { type: Boolean, default: false }, // TCP = To Change Password;
      darkMode: { type: Boolean, default: false },
      colorTheme: { type: String, default: "bg-gO" },
      firstLogin: { type: Boolean, default: false }, // for the Congrats Component
    },
    starTalents: [{ type: Schema.Types.ObjectId, ref: "Talent" }],
    starProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    searches: [{ type: Schema.Types.ObjectId, ref: "Search" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    conversations: [{ type: Schema.Types.ObjectId, ref: "Conversation" }],
    date: { type: Date, default: Date.now },
  },
  { strictQuery: true },
  { timeStamps: true }
);

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const RecruiterModel = model("Recruiter", recruiterSchema, "recruiters");
export default RecruiterModel;
