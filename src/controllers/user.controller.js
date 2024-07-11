import { User } from "../models/users.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Income } from "../models/income.model.js";
import { Expense } from "../models/expense.model.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      " Something went wrong while generating Access and Refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, fullName } = req.body;

  if (!username) {
    req.flash("registerError", "Username is required to register");
    return res.redirect("/user/signup");

    // throw new ApiError(404, "Username is required to register");
  }
  if (!email) {
    req.flash("registerError", "Email is required to register");
    return res.redirect("/user/signup");

    // throw new ApiError(404, "Email is required to register");
  }
  if (!password) {
    req.flash("registerError", "Password is required to register");
    return res.redirect("/user/signup");

    // throw new ApiError(404, "Password is required to register");
  }
  if (!fullName) {
    req.flash("registerError", "FullName is required to register");
    return res.redirect("/user/signup");

    // throw new ApiError(404, "FullName is required to register");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    req.flash("registerError", "Username or Email already register");
    return res.redirect("/user/signup");

    // throw new ApiError(400, " Username or Email is already exist ");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email,
    fullName: fullName,
    password: password,
  });

  if (!user) {
    throw new ApiError(500, "User not created");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const accessToken = user.generateAccessToken();

  res.cookie("accessToken", accessToken, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000  }); // 2 hour
  res.redirect("/user/profile");

  // .json(new ApiResponse(200, accessToken, "User successfully LoggedIn"));
});

const loggedInUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    req.flash("loginError", "Email and Password is required to login");
    return res.redirect("/user/signin");

    // throw new ApiError(404, "Email and Password is required to login");
  }

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("loginError", "Email not register yet");
    return res.redirect("/user/signin");

    // throw new ApiError(404, "User not found to login");
  }

  const passwordCorrect = await user.isPasswordCorrect(password);

  if (!passwordCorrect) {
    req.flash("loginError", "Email or Password is incorrect");
    return res.redirect("/user/signin");

    // throw new ApiError(404, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  if (!(accessToken && refreshToken)) {
    throw new ApiError(500, " Both tokens are not generating ");
  }

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedUser) {
    throw new ApiError(500, " While Logging In Something went wrong ");
  }

  res
  .cookie("accessToken", accessToken, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 }) // 2 hours
  .cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
  .redirect("/user/profile");
  // .json(new ApiResponse(200, loggedUser, "loggedIn successfully"))
});

const loggedOutUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  const options = {
    httpOnly: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .redirect("/user/signin");
  // .json(new ApiResponse(200, {}, "successfully loggedOut"));
});

const incomeTransaction = asyncHandler(async (req, res, next) => {
  const { title, amount, date } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required.");
  }

  if (!amount) {
    throw new ApiError(400, "Amount is required.");
  }

  if (!date) {
    throw new ApiError(400, "Date is required.");
  }

  const income = await Income.create({
    title,
    amount,
    date,
    user: req.user?._id,
  });

  if (!income) {
    throw new ApiError(400, "Income not created.");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  user.incomes.push(income?._id);
  await user.save({ validateBeforeSave: false });

  await allTransactionAmount(user?.id);

  return res.status(201).redirect("/user/records");
  // .json(new ApiResponse(201, income, "Successfully created Income."));
});

const expenseTransaction = asyncHandler(async (req, res, next) => {
  const { title, amount, date } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required.");
  }

  if (!amount) {
    throw new ApiError(400, "Amount is required.");
  }

  if (!date) {
    throw new ApiError(400, "Date is required.");
  }

  const expense = await Expense.create({
    title,
    amount,
    date,
    user: req.user?._id,
  });

  if (!expense) {
    throw new ApiError(400, "Expense not created.");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  user.expenses.push(expense?._id);

  await user.save({ validateBeforeSave: false });

  await allTransactionAmount(user?._id);

  return res.status(201).redirect("/user/records");
  // .json(new ApiResponse(201, expense, "Successfully created Expense."));
});

const allTransactionAmount = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate("expenses")
      .populate("incomes");

    if (!userId) {
      throw new ApiError(400, "User can't found ");
    }

    let totalExpense = 0;
    let totalIncome = 0;

    user.expenses.forEach((expense) => {
      totalExpense += expense.amount;
    });

    user.incomes.forEach((income) => {
      totalIncome += income.amount;
    });

    const totalBalance = totalIncome - totalExpense;

    user.totalExpense = totalExpense;
    user.totalIncome = totalIncome;
    user.totalBalance = totalBalance;

    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while calculating the total balance"
    );
  }
};

const getallData = async (req, res, next) => {
  const user = await User.findById(req.user?._id)
    .populate("expenses")
    .populate("incomes");

  const expense = user.expenses;
  const income = user.incomes;

  const arr = [...expense, ...income].sort((a, b) => b.createdAt - a.createdAt);

  return { user, arr };
};

const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id)
    .populate("expenses")
    .populate("incomes");

    const comment = await Comment.find();
    comment.forEach(async (elem)=>{
      if(user._id == elem.user.toString()){
        await Comment.findByIdAndDelete(elem._id.toString());
      }
    })

  user?.expenses.forEach(async (elem) => {
    await Expense.findByIdAndDelete(elem?._id);
  });

  user?.incomes.forEach(async (elem) => {
    await Income.findByIdAndDelete(elem?._id);
  });

  await User.findByIdAndDelete(req.user?._id);

  return res.status(200).redirect("/user/signup");
  // .json(new ApiResponse(200, {} , "User Successfully deleted from database"))
});

const commentsRender = asyncHandler(async (req, res, next) => {
  const allcomments = await Comment.find().populate("user");

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }

  const formatcomments = allcomments.map((elem) => {
    return {
      ...elem.toObject(),
      createdAt: formatDate(elem.createdAt),
      username: elem.user.username,
      comment: elem.comment,
      rate: elem.rate,
      _id: elem._id,
      avatar: elem.user.avatar,
      commentuserId: elem.user._id, // comment user Id
    };
  });

  let founder = formatcomments.filter((elem)=>{
    return elem.admin == true
  });

  formatcomments.splice(0,1);


  return res.render("feedback", { user: req.user, formatcomments, founder });
});

const createComment = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const { comment } = req.body;

  if (!comment) {
    throw new ApiError(404, "Write something !");
  }

  const createdComment = await Comment.create({
    user: user._id,
    comment,
  });

  if (!createdComment) {
    throw new ApiError(500, "Something went wrong while commenting");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { createdComment, user },
        "Successfully created comment"
      )
    );
});

const deleteTransaction = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id)
    .populate("expenses")
    .populate("incomes");

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const { type, id } = req.params;

  try {
    if (type == "expense") {
      let expenseDelete = await Expense.findByIdAndDelete(id);

      user.expenses.pull(id);
      await user.save({ validateBeforeSave: false });

      if (!expenseDelete) {
        throw new ApiError(400, "Expense didn't deleted");
      }
    } else if (type == "income") {
      let incomeDelete = await Income.findByIdAndDelete(id);

      user.incomes.pull(id);
      await user.save({ validateBeforeSave: false });

      if (!incomeDelete) {
        throw new ApiError(400, "Income didn't deleted");
      }
    }

    allTransactionAmount(user._id);
  } catch (error) {
    console.error("Error:", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { type, id }, "Successfully deleted"));
});

const addingRate = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Type or Id didn't found");
  }

  const comment = await Comment.findById(id);

  try {
    if (comment.rate.indexOf(user?._id) == -1) {
      comment.rate.push(user?._id);
    } else {
      comment.rate.pull(user?._id);
    }

    await comment.save({ validateBeforeSave: false });
  } catch (error) {
    console.error("Error:", error);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Successfully Rated"));
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Comment Id didn't find to delete");
  }

  const commentDelete = await Comment.findByIdAndDelete(id);

  if (!commentDelete) {
    throw new ApiError(
      500,
      "Comment didn't deleted for someReason please Try again"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { commentDelete }, "Successfully deleted"));
});

export {
  registerUser,
  loggedInUser,
  loggedOutUser,
  expenseTransaction,
  incomeTransaction,
  getallData,
  deleteAccount,
  createComment,
  deleteTransaction,
  commentsRender,
  addingRate,
  deleteComment,
};
