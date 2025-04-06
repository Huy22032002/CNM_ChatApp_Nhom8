import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./src/configs/connectRDS.js";
connectDB();

const PORT = process.env.PORT;

import app from "./src/app.js";

app.listen(PORT, () => {
  console.log(`listen on PORT ${PORT}`);
});
