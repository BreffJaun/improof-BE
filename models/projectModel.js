// I M P O R T   D E P E N D E N C I E S
import { Schema, model } from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "http://localhost:2404/media/63f337eba0ba86c3d1b35c06" },
    color: { type: String, default: "bg-gO" },
    category: { type: String, default: "" },
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    inviteOthers: [{ type: String }],
    private: { type: Boolean, default: false },
    stones: [{ type: Schema.Types.ObjectId, ref: "Stone" }],
  },
  { strictQuery: true, timestamps: true }
);

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const ProjectModel = model("Project", projectSchema, "projects");
export default ProjectModel;
