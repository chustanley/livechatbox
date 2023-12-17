const router = require("express").Router();
const Message = require("../models/Message");

//ADD

/*
Req.body is an object that has convoID, sender, and text. All strings.

When you are... in the conversation, you send a message, it will create a post request with..
- conversationID of the current convo
- sender aka YOU.
- The message YOU created.
*/

router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET

/*
We will send a conversation ID through a query, and it will search through the message collection and look for any value
- that is conversationId: givenConvoId.

This is the same as the conversation collection modal
- Given a key, we search the collection.

Behind the scenes: If 2 people are in the same conversation
conversationId: will be the same
sender: will CHANGE from 1 user to another to whoever is sending the message
text: will CHANGE depending on whos sending and what they wanted to send.


THIS WILL SEND BACK EVERY SINGLE MESSAGE FROM A SPECIFIC CONVERSATION!
-This will send it back in whatever was sent first. just the way we want it

*/

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
