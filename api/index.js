import "dotenv/config";
import app from "./src/app.js";
import { SETTINGS_ENV } from "./src/settings/index.js";
import { dbConnect } from "./src/config/db.js";

const { port } = SETTINGS_ENV.app;

app.listen(port, () => {
  console.log(`Server on port ${port} running`);
  dbConnect();
});
