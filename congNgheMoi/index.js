require("dotenv").config();

const { connectDB } = require("./src/configs/connectRDS");
connectDB();

const PORT = process.env.PORT;
const cors = require("cors");
const express = require("express");

const app = require("./src/app");

app.use(cors());
app.use(cors({
  origin: "http://localhost:5173",
}))
app.get("/api/data", (req, res) => {
  res.send("Hello World!");
});
app.listen(PORT, (req, res) => {
  console.log(`listen on PORT ${PORT}`);
});
