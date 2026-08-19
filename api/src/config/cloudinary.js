import { v2 as cloudinary } from "cloudinary";
import { SETTINGS_ENV } from "../settings/index.js";

cloudinary.config({
  cloud_name: SETTINGS_ENV.cloudinary.cloudName,
  api_key: SETTINGS_ENV.cloudinary.apiKey,
  api_secret: SETTINGS_ENV.cloudinary.apiSecret,
});

export default cloudinary;

