// require("dotenv").config({ path: "./env" }); // this makes code ugly lookwise so we can modify the

import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

connectDB();

/*  1st Approach of DB connection
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERR", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERR", error);
    throw error;
  }
})();

*/
