import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

/*  what does verifyJWTtoken does : To verify tokens that is access and refresh
 and certainly logging Out . SO this check if user have tokens or not if have then loggedout 
 if don't have then logged In so this it do  */

 export const verifyJWTtoken = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    const secret = req.cookies?.accessToken ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;

    if (!token) {
      return res.redirect('/user/signup');
    }

    const decodedToken = jwt.verify(token, secret);
    if (!decodedToken) {
      throw new ApiError(404, "Token verification failed.");
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "Invalid Access Token.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.redirect("/user/signin");
  }
});

