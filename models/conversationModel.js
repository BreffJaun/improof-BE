// I M P O R T   D E P E N D E N C I E S
import {Schema, model} from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const conversationSchema = new Schema({
  participantT: [{type: Schema.Types.ObjectId, ref: "Talent"}],
  participantR: [{type: Schema.Types.ObjectId, ref: "Recruiter"}],
  message: [{type:Schema.Types.ObjectId, ref: "Message"}]
}
, 
{strictQuery: true});

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const ConversationModel = model('Conversation', conversationSchema, 'conversations');
export default ConversationModel;