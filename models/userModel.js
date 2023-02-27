// I M P O R T   D E P E N D E N C I E S
import { Schema, model } from "mongoose";

const INITIALTHEME = ["c-DB2","bg-gDB"]
// S C H E M A  -  D A T A   S T R U C T U R E
const userSchema = new Schema(
  {
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      avatar: { type: String, default: ""},
      description: { type: String, default: "" },
      goal: { type: String, default: "" },
      position: { type: String, default: "" },
      category: { type: String, default: "" },
      initials: { type: String, default: "" },
      // TALENT
      toolsAndSkills: { type: String, default: "" },
      isTalent: { type: Boolean, default: false },
      // RECRUITER
      isRecruiter: { type: Boolean, default: false },
    },
    contact: {
      mobile: { type: String, default: "" },
      website: { type: String, default: "" },
      // TALENT
      online1: { type: String, default: "" },
      online2: { type: String, default: "" },
      online3: { type: String, default: "" },
      // RECRUITER
      company: { type: String, default: "" },
    },
    // TALENT
    location: {
      street: { type: String, default: "" },
      zip: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    meta: {
      isVerified: { type: Boolean, default: false },
      isVerifiedTCP: { type: Boolean, default: false }, // TCP = To Change Password;
      darkMode: { type: Boolean, default: false },
      colorTheme: [{ type: String}],
      firstLogin: { type: Boolean, default: true }, // for the Congrats Component
      loginCount: { type: Number, default: 0 },
    },
    starProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    myProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    conversations: [{ type: Schema.Types.ObjectId, ref: "Conversation" }],
    date: { type: Date, default: Date.now },
    follows: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { strictQuery: true, timestamps: true }
);

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const UserModel = model("User", userSchema, "users");
export default UserModel;
