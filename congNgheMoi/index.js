import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./src/configs/connectRDS.js";
connectDB();

const PORT = process.env.PORT;
const cors = require("cors");
const express = require("express");

import app from "./src/app.js";

app.listen(PORT, (req, res) => {
  console.log(`listen on PORT ${PORT}`);
});
