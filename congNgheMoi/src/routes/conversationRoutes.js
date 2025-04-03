const express = require("express");
const ConversationController = require("../controllers/conversationController");
const router = express.Router();

router.post("/add", ConversationController.createConversation);
router.get("/:user_id", ConversationController.getAllConversations);

module.exports = router;
