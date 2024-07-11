import {connectDB} from "./db/database.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0';

    app.listen(PORT, HOST, () => {
      app.once("error", (error) => {
        console.log("Error: " + error);
        throw error;
      });
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection failed : ${error}`);
  });
