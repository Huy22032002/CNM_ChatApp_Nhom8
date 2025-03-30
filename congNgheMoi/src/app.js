const express = require("express");
const homeRoutes = require("./routes/homeRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//su dung routes
app.use("/", homeRoutes);

module.exports = app;
