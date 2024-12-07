import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// router import

import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter);

// http://localhost:8000/api/v1/users/register`

export { app };

/* 
express.json: Parses the request body if it’s JSON and ensures the size doesn’t exceed 16 KB.
express.urlencoded: Parses URL-encoded form data if present, ensuring the payload size stays within 16 KB.
express.static: Checks if the requested resource is a static file in the public directory. If yes, it serves the file and skips the next middleware.
cookieParser: Parses cookies from the request and attaches them to req.cookies.
*/
