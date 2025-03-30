const express = require("express");
const router = express.Router();
const userControler = require("../controllers/userController");

router.post("/add", userControler.createUser);
router.get("/", userControler.getAllUser);

module.exports = router;
