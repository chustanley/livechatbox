import "./messenger.css";
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversations/Conversation";
import Message from "../../components/message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import React, { useState, useEffect, useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

const Messenger = () => {
  //This keeps track of multiple conversations on the side RELATED to the user.
  const [conversations, setConversations] = useState([]);

  //These states are for the current we are speaking to, and the messages inside of it as well.
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  //This state is for the newly generated message that we are ADDING onto the conversation.
  const [newMessage, setNewMessage] = useState("");

  const [arrivalMessage, setArrivalMessage] = useState(null);

  //This gets the 'user data' from the useContext state
  const { user } = useContext(AuthContext);

  const scrollRef = useRef();
  const socket = useRef();

  useEffect(() => {
    console.log("arrival message", arrivalMessage);
  }, [arrivalMessage]);

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    //THIS IS SETTING UP AN EVENT LISTENER? I DONT THINK IT TRIGGERS ON FIRST RENDER UNTIL A MESSAGE IS SENT
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  //This is just showing us the users that are currently logged in and not disconnected.
  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      console.log("users array", users);
    });
  }, [user]);

  //UPON id change, we will get ALL CONVERSATIONS related to that user and ASSIGN it to the conversation state
  //This generates ALL conversations related to the user._id
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        console.log(res.data);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  //Upon currentChat changing upon clicking in the list of conversations, we will send a get request along with that conversationID!!!
  //and set the messages state with all of the messaged tailored to that convo ! we use CONVO ID!!!
  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  //Whenever messages change, meaning when you send a message or if i send a message, this with the useRef it will autoscroll to it!
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //This is for submitting a newMessage. We create a messageobject with the newMessage data inside of it.
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent rerender of page!
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const recieverId = currentChat.members.find((member) => {
      return member !== user._id;
    });

    console.log("troll", recieverId);

    //Sending to the server, the tag, the senderID (your id), the recieverID(the other person), and the message
    socket.current.emit("sendMessage", {
      senderId: user._id,
      recieverId: recieverId,
      text: newMessage,
    });

    //This is adding the newMessage into MONGODB and after it sucessfully adds into the db,
    //We spread the currentMessages and add res.data (the new message) into the end
    //So that it can "auto render" WITHIN our OWN localhost account.

    /*
    THIS WILL AUTO UPDATE MESSAGES THAT YOU SEND INTO THE BIG CHAT BOX IMMEDIATELY WITHOUT SOCKET.IO!!!!'

    We need Socket IO to retrieve the messages from THE OTHER USER!!


    SO TECHNICALLY, after it does the socket.io transaction that triggers event listners, itll then go ahead and save that sent message into the database.....

    WOOWW.....
    */

    try {
      const res = await axios.post("/messages", message);
      console.log("new message", res.data);

      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Topbar />
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input placeholder="Search for friends" className="chatMenuInput" />
            {conversations.map((c) => {
              //FOR each conversaion related to one user, we will pass the currentUser to it and also the conversation data for EACH conversation.
              //When any of them are clicked, we update the currentChat with the value inside of conversations
              //Upon click, currentChat will be updated with a new message:[user1, you]
              return (
                <div
                  onClick={() => {
                    setCurrentChat(c);
                  }}
                >
                  <Conversation conversation={c} currentUser={user} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="chatBox">
          {currentChat ? (
            //THIS IS VERY IMPORTANT.
            /*
            We are iterating through the messages state that has now generated an array for all the messages of a specific conversation.
            REMEMBER, this component is rendered based on the users._id meaning that if stanley logged in the userId would be different than if idk quyen came in.
            With that being said, it would change the "own" prop that message component would receive and based off of this condition, we will render different CSS!!!!!!!

            */
            <div className="chatBoxWrapper">
              <div className="chatBoxTop">
                {messages.map((m) => {
                  return (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === user._id} />
                    </div>
                  );
                })}
              </div>
              <div className="chatBoxBottom">
                {/* on Change, we will add the newly updated value into newMessage state. */}
                <textarea
                  className="chatMessageInput"
                  placeholder="write something..."
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                  }}
                  value={newMessage}
                ></textarea>
                <button className="chatSubmitButton" onClick={handleSubmit}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            //IF NO CURRENT CHAT!!!!!!!
            <span className="noConversationText">PICK A CONVERSATION</span>
          )}
        </div>

        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline />
            <ChatOnline />

            <ChatOnline />

            <ChatOnline />

            <ChatOnline />

            <ChatOnline />
          </div>
        </div>
      </div>
    </>
  );
};

export default Messenger;
