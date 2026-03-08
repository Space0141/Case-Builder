import { app } from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
  console.log(`Case Builder backend running on port ${config.port}`);
});
