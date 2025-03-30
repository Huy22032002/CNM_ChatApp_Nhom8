const express = require("express");
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//su dung routes
app.use("/", homeRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
