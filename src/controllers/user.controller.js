import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinaryUploadFile } from "../utils/Cloudinary.js";

const generateAccessandrefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log("access", user.generateAccessToken());

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from FE
  //Validatiom - not empty
  //check if user already exists : username, email
  //check for images , check for avatar
  //upload them to cloudinary, avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { userName, email, fullName, password } = req.body;
  console.log("email", email);

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //finde from db
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // console.log(req.files);
  const avatarlocalPath = req.files?.avatar[0]?.path;
  // const coverImagelocalPath = req.files?.coverImage[0]?.path; will apply another way to handle file

  let coverImagelocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagelocalPath = req.files.coverImage[0].path;
  }

  if (!avatarlocalPath) {
    throw new ApiError(400, "Avtar file is required");
  }

  const avatar = await cloudinaryUploadFile(avatarlocalPath);
  const coverImage = await cloudinaryUploadFile(coverImagelocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avtar file is required");
  }

  //create user in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    userName: userName.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  /* 
  .select(
      "-password -refreshToken"
    )
  Purpose: Specifies which fields to include or exclude in the returned document.
  Key Points:
  "-password": Excludes the password field.
  "-refreshToken": Excludes the refreshToken field.
  Fields with - are excluded; fields without - are included.
  */

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = async (req, res) => {
  //req body -> data
  //userName or email
  //find the user
  //password check
  //access and refresh token generate
  //send cookies
  //send response

  try {
    const { email, userName, password } = req.body;

    // if (!(userName || email)) {
    //   throw new ApiError(400, "uername or email required");
    // }

    // alternative if both required

    if (!userName && !email) {
      throw new ApiError(400, "uername or email required");
    }

    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(404, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessandrefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    // To avoid change cookies by Front end , server can only edit cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User Logged In Successfully"
        )
      );
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Something went wrong",
    });
  }
};

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    htmlOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logedout Successfully"));
});

export { registerUser, loginUser, logoutUser };
