const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/messageController");

router.post("/add", MessageController.createMessage);
router.get("/:converId", MessageController.getAllMessageByConversationId);

module.exports = router;
