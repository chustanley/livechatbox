const router = require("express").Router();
const Conversation = require("../models/Conversation");

//This is creating conversations between 1 user and another
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.recieverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//This is getting a convo of a user im assuming its to get one of itself

/*
This is adding a userId params into the end of conversation endpoint

whatever is after localhost:8800/api/conversation/_____ is going to be the userID.

to search through the whole model, we call the model with .find and send in an object with the item were looking for.
*/
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
