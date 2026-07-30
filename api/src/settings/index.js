import { required } from "../shared/required.env.js";

export const SETTINGS_ENV = {
  app: {
    port: Number(process.env.PORT) || 4001,
  },
  db: {
    uri: required("MONGO_URI"),
  },
};
