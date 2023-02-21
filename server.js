// I M P O R T:  E X T E R N A L  D E P E N D E N C I E S
import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// I M P O R T:  R O U T E S
import searchRouter from "./routes/searches.js";
import userRouter from "./routes/users.js";
import { mediaRouter } from "./routes/medias.js";
import projectRouter from "./routes/projects.js";
import notificationRouter from "./routes/notifications.js";
import messageRouter from "./routes/messages.js";
import conversationRouter from "./routes/conversations.js";
import wrongRoutes from "./routes/wrongPath.js";
import stoneRouter from "./routes/stones.js";

// ** MULTER START ** //
// IMPORT FOR MULTER
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// VARIABLES FOR MULTER
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// ** MULTER END ** //

// I M P O R T:  E R R O R  H A N D L E R
import { errorHandler } from "./middleware/errorhandler.js";

// C O N N E C T   W I T H   M O N G O O S E  D B
const MONGO_DB_CONNECTION_STRING =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority` ||
  "mongodb://localhost:27017";
const PORT = process.env.PORT || 4000;

// gridBucket is for retrieving files from the Database
export let gridBucket;
mongoose.set("strictQuery", false); // to prevent an erroneous error message
mongoose
  .connect(MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect with MongoDB: SUCCESS ✅"); 
    let db = mongoose.connections[0].db;
    gridBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "photos" 
    });
  })
  .catch((err) => console.log("Connect with MongoDB: FAILED ⛔", err));
// for errors which comes after the successfully connection
mongoose.connection.on("error", console.log);

// I M P O R T  &  D E C L A R E   B C R Y P T   K E Y
const FE_HOST = process.env.FE_HOST;

// ========================

// C R E A T E  S E R V E R
const app = express();
app.use(express.static("public"));

// For Multer
// app.use(express.static("uploads")); // notwendig?
// app.use(express.static("dist")); // notwendig?

// M I D D L E W A R E

// SERVER MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [FE_HOST, "http://127.0.0.1:5173"], // fill in here render address
    // if you want to add more adresses in cors, make an array with single strings.
    credentials: true,
  })
);
app.use(morgan("dev"));

// ROUTER MIDDLEWARE
// USERS
app.use("/users", userRouter);

// MULTER
// app.get("/uploads/:id", (req, res) => {
//   res.sendFile(`${__dirname}/uploads/${req.params.id}`);
// });

// GRID FS
app.use("/media", mediaRouter) ;

// SEARCH
app.use("/search", searchRouter);

// PROJECT
app.use("/projects", projectRouter);

// NOTIFICATIONS
app.use("/notifications", notificationRouter);

// CONVERSATIONS
app.use("/conversations", conversationRouter);

// MESSAGES
app.use("/messages", messageRouter);

// STONES
app.use("/stones", stoneRouter);

// PROJECTS
app.use("/projects", projectRouter);

// ERROR HANDLER
app.use(errorHandler);

// WRONG PATH HANDLER
app.use("*", wrongRoutes);

// S E R V E R - S T A R T
app.listen(PORT, () => {
  console.log("Server runs on Port: " + PORT, "🔄");
});
