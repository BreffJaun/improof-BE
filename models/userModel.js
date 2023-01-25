// I M P O R T   D E P E N D E N C I E S
import {Schema, model} from "mongoose";

// S C H E M A  -  D A T A   S T R U C T U R E
const userSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: false, unique: true},
  // with unique we check and go sure, that this email doesn`t already exists in the database
  password: {type: String, required: true},
  avatar: {type: String},
  isAdmin: {type: Boolean, default: false},
  isVerified: {type: Boolean, default: false},
  isVerifiedTCP: {type: Boolean, default: false}  // TCP = To Change Password;
  // ,
  // user: {type: Schema.Types.ObjectId, ref: "User", required: true}
  // ,
  // paid: {type: Boolean, default: false}
  // ,
  // price: {type: Number, required: true}
  // ,
  // lastName: {type: [String], required: true}
  // ,
}
// ,
// {
//   toObject: {
//   virtuals: true
//   },
//   toJSON: {
//   virtuals: true
//   } 
// }
, 
{strictQuery: true});

// Virtual
// userSchema.virtual("fullName").get(function() {
//   return `${this.firstName} ${this.lastName}`
// })

// M O D E L - T E M P L A T E   F O R   D B   E N T R I E S
const UserModel = model('User', userSchema, 'users');
export default UserModel;