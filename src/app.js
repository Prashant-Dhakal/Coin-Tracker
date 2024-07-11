import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import session from "express-session";
import flash from "connect-flash"
import axios from "axios";

import { dirname } from "path";
import { fileURLToPath } from "url";

const limited = "16kb";
const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));
app.set("views", path.join(__dirname + "/views"));

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: limited }));
app.use(express.urlencoded({ extended: true, limit: limited }));
app.use(express.static("public"));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "Bbd24jp[afjna$jafa"
}));
app.use(flash());

app.use((req,res,next)=>{
  res.locals.messages = req.flash();
  next();
})

app.set("view engine", "ejs");
app.use(cookieParser());

// main Routes

app.get('/', (req, res) => {
  res.redirect('/user/profile');
});

// routes
import { router } from "./routes/user.routes.js";

app.use("/user", router);

export default app;



