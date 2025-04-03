const express = require("express");
const router = express.Router();
const userDetailController = require("../controllers/userDetailController");

router.post("/add", userDetailController.createUserDetail);

module.exports = router;
