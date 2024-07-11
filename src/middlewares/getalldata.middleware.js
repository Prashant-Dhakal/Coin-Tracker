import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getallData } from "../controllers/user.controller.js";

export const getTransactionData = asyncHandler(async (req, res, next) => {
  try {
    const alldata = await getallData(req, res, next);

    if (!alldata) {
      throw new ApiError(400, "Something went wrong while fetching the data");
    }

    req.alldata = alldata;

    next();
  } catch (error) {
    throw new ApiError(401, "All the transaction data didn't fetched !");
  }
});
