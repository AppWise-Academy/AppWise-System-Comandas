import mongoose from "mongoose";
import { SETTINGS_ENV } from "../settings/index.js";

export const dbConnect = async () => {
  const { uri } = SETTINGS_ENV.db;
  await mongoose
    .connect(uri)
    .then(() => {
      console.log("********* CONNECTED DATABASE **********");
    })
    .catch((error) => {
      console.log({
        message: error.message,
        status: "********* ERROR CONNECT DATABASE **********",
      });
    });
};
