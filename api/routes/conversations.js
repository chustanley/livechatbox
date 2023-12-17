const router = require("express").Router();
const Conversation = require("../models/Conversation");

/*
This creates a conversation between 1 user (yourself) and another (someone else)
- You are taking there 'id' in the videos case, they are using the generated _id from Mongo
- You are saving it in an members collection as an array. If sucessful, we call the save function which saves the new instance into the MongoDB database in the conversations (modal) collection
- VIDEO DOESNT SHOW: assuming you click on another user and grab its id and create conversation.


This route recieves data through the /api/conversations route
*/

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

/*

This gets the conversation ID from 2 people.

PARAMS IS ON THE LINK ITSELF!

This is adding a userId params into the end of conversation endpoint
whatever is after localhost:8800/api/conversation/_____ is going to be the userID.

HOW IT WORKS!

Conversation.find() initiates a query to find documents in the Conversation collection.
{ members: { $in: [req.params.userId] } } is the query condition passed to the find() method.
{ $in: [req.params.userId] } with $in is a MongoDB query operator that checks if the provided value (req.params.userId) exists in the members array.

Result: will send back multiple convos that have the provided ID.
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
