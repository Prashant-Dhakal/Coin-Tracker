import { Router } from "express";
import { verifyJWTtoken } from "../middlewares/auth.middleware.js";
import { getTransactionData } from "../middlewares/getalldata.middleware.js";
import {
  loggedInUser,
  loggedOutUser,
  registerUser,
  incomeTransaction,
  expenseTransaction,
  deleteAccount,
  deleteTransaction,
  createComment,
  commentsRender,
  addingRate,
  deleteComment,
} from "../controllers/user.controller.js";

const router = Router();

router.route("/signin").get((req,res,next)=>{
  res.render("signin")
});

router.route("/signup").get((req,res,next)=>{
  res.render("signup")
});

router.route("/transaction").get(verifyJWTtoken,(req,res,next)=>{
  res.render("transaction")
});

router.route("/profile").get(verifyJWTtoken ,getTransactionData,(req,res,next)=>{
  let incomeFormatted = req.user.totalIncome.toLocaleString();
  let expenseFormatted = req.user.totalExpense.toLocaleString();

  res.render("profile", {incomeFormatted, expenseFormatted, loggedUser: req.alldata})
});

router.route("/setting").get(verifyJWTtoken ,(req,res,next)=>{
  res.render("setting")
});

router.route("/donation").get((req,res,next)=>{
  res.render("donation")
});


router.route("/feedback").get( verifyJWTtoken, commentsRender);

router.route("/createcomment").post(verifyJWTtoken , createComment);

router.route("/deletecomment/:id").delete(verifyJWTtoken , deleteComment);

router.route("/rating/:id").post(verifyJWTtoken, addingRate);

router.route("/chart").get((req,res,next)=>{
  res.render("chart")
});

// To get all data from Backend and You can use to send a response to the frontend with the data . 

router.route("/getdataback").get(verifyJWTtoken, getTransactionData , async (req,res,next)=>{
  res.send(req.alldata)
});

router.route("/deleteTransaction/:type/:id").delete(verifyJWTtoken, deleteTransaction);

router.route("/records").get(verifyJWTtoken, getTransactionData, async (req,res,next)=>{
  let incomeFormatted = req.user.totalIncome.toLocaleString();
  let expenseFormatted = req.user.totalExpense.toLocaleString();
  let balanceFormatted = req.user.totalBalance.toLocaleString();

  res.render('records', {incomeFormatted, expenseFormatted, balanceFormatted, transactionArr: req.alldata});
});

router.route("/deleteAccount").get(verifyJWTtoken, deleteAccount)

router.route("/register").post(registerUser);

router.route("/login").post(loggedInUser);

router.route("/logout").get(verifyJWTtoken , loggedOutUser);

router.route("/income").post( verifyJWTtoken , incomeTransaction);

router.route("/expense").post( verifyJWTtoken , expenseTransaction);



export { router };
