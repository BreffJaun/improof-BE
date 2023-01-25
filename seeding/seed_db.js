// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv"; dotenv.config();
import mongoose from "mongoose";
import {faker} from "@faker-js/faker";

// I M P O R T:  M O D E L
import UserModel from "../models/userModel.js";

// C O N N E C T   W I T H   M O N G O O S E  D B
const MONGO_DB_CONNECTION_STRING = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority` || "mongodb://localhost:27017"

mongoose.set("strictQuery", false); // to prevent an erroneous error message
mongoose.connect(MONGO_DB_CONNECTION_STRING, 
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connect with MongoDB: SUCCESS ✅'))
.catch((err) => console.log('Connect with MongoDB: FAILED ⛔', err))
// for errors which comes after the successfully connection
mongoose.connection.on('error', console.log);

// S E E D I N G   P R O C E S S
seed()

async function seed() {
  try {
    const fakeUserData= []
    for(let i = 0; i < 50; i++) {
      fakeUserData.push({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.exampleEmail(),
        password: faker.internet.password()
      })
    }
    const userPromise = UserModel.insertMany(fakeUserData);
    const values = await Promise.all([
      userPromise
    ])
    console.log("Seeding complete", values);
  } catch (err) {
    console.log(err);
  } finally {
    mongoose.disconnect()
  }
}

// npm run seed
// to seed the db (fill it with fake data)