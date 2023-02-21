// I M P O R T   D E P E N D E N C I E S
import { Schema, model } from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const stoneSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    kind: { type: String, required: true },
    media: [{ type: String, default: ""}],
    contentType: {type: String, default: ""},
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { strictQuery: true, timestamps: true }
);

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const StoneModel = model("Stone", stoneSchema, "stones");
export default StoneModel;
