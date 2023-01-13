require("dotenv").config();
import Express from "express";
import morgan from "morgan";
import cors from "cors";
import apiRouter from "./routes/index";
import mongoose from "mongoose";

// const db =
//   "mongodb+srv://rw_minningdb:erodWeokldQASDlold34QW@production-main.y7axy.mongodb.net/minningdb?retryWrites=true&w=majority";

const db =
  "mongodb+srv://gari1:pratik1@gari.hquzlmw.mongodb.net/?retryWrites=true&w=majority";

const app = Express();

if (db) {
  mongoose
    .connect(db, {
      readPreference: "secondaryPreferred",
    })
    .then(() => console.log("db connected"))
    .catch((err) => console.log("DB Connection Failed", err));
}

app.use(morgan("dev"));

const allowedOrigins = ["https://pre-mint.chingari.io"];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

app.use(cors(options));

app.use(Express.json());

app.use("/api/", apiRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`RUNNING ON PORT ${PORT}`);
});
