// I M P O R T   D E P E N D E N C I E S
import { Schema, model } from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const messageSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId }, // Falls nicht geht, type: String
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { strictQuery: true },
  { timeStamps: true }
);

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const MessageModel = model("Message", messageSchema, "messages");
export default MessageModel;
