// I M P O R T   D E P E N D E N C I E S
import {Schema, model} from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const searchesSchema = new Schema({
  searchName: {type: String, required: true, default: "New Search"},
  position: {type: String},
  toolsAndSkills: {type: String},
  zip: {type: String},
  searchRadius: {type: Number},
  recruiter: [{type: Schema.Types.ObjectId, ref: "Recruiter"}]
}
, 
{strictQuery: true});

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const SearchModel = model('Search', searchesSchema, 'searches');
export default SearchModel;