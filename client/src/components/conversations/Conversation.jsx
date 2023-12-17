import React, { useState, useEffect } from "react";
import "./conversation.css";
import axios from "axios";

const Conversation = ({ conversation, currentUser }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    //This gets the member ID.
    //You are iterating through conversation.members and if you find a id that isnt the same as YOUR current user id. return it
    const friendId = conversation.members.find((m) => {
      if (m !== currentUser._id) return currentUser._id;
    });

    //This is called if you want to add specific user detail to your webpage of the person your having a conversation with.
    //In our case, we want to add the receivers name on the side bar. This component is given the conversation details
    //However, we need the names of the reciever so our users know who they have conversations with.
    const getUser = async () => {
      try {
        //AXIOS without post is assumed to be a get request. userID is used as a query object.
        const res = await axios("users?userId=" + friendId);
        console.log(res);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);

  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
        alt=""
      />
      <span className="conversationName">{user?.username}</span>
    </div>
  );
};

export default Conversation;
