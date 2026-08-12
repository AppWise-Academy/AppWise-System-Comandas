import { required } from "../shared/required.env.js";

export const SETTINGS_ENV = {
  app: {
    port: Number(process.env.PORT) || 4001,
  },
  db: {
    uri: required("MONGO_URI"),
  },
  cloudinary: {
    cloudName: required("CLOUDINARY_CLOUD_NAME"),
    apiKey: required("CLOUDINARY_API_KEY"),
    apiSecret: required("CLOUDINARY_API_SECRET")
  }
};
