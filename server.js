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
import projectRouter from "./routes/projects.js";
import notificationRouter from "./routes/notifications.js";
import messageRouter from "./routes/messages.js";
import conversationRouter from "./routes/conversations.js";
import wrongRoutes from "./routes/wrongPath.js";
import stoneRouter from "./routes/stones.js";
import counterRouter from "./routes/counters.js";

// I M P O R T:  E R R O R  H A N D L E R
import { errorHandler } from "./middleware/errorhandler.js";

// C O N N E C T   W I T H   M O N G O O S E  D B
const MONGO_DB_CONNECTION_STRING =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority` ||
  "mongodb://localhost:27017";
const PORT = process.env.PORT || 4000;


mongoose.set("strictQuery", false); // to prevent an erroneous error message
mongoose
  .connect(MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connect with MongoDB: SUCCESS ✅"); 
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

// M I D D L E W A R E

// SERVER MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://improof.onrender.com", "http://127.0.0.1:5173", "http://localhost:5173", "https://improof-fe.vercel.app"], 
    credentials: true,
  })
);
app.use(morgan("dev"));

// ROUTER MIDDLEWARE
// COUNTER
app.use("/counters", counterRouter);

// USERS
app.use("/users", userRouter);

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
