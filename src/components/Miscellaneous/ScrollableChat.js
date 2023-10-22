import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../Config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";

const ScrollableChat = ({messages}) => {
    const {user} = ChatState();

    return(
        <ScrollableFeed>
            {messages && messages.map((m,i) => (
                <div style={{display: 'flex', alignItems: 'center'}} key={m._id}>
                    {
                        (isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && 
                        (
                            <img style={{height: "30px", width: "auto", border: '1px solid black', marginRight: '5px', borderRadius: '50%'}} src={m.sender.profile} alt="profile" />
                        )
                    }

                    <span 
                    style={{backgroundColor: (m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"),
                    borderRadius: '20px',
                    padding: '5px 15px',
                    maxWidth: '75%',
                    marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10
                    }}
                    >
                        {m.content}
                    </span>
                </div>
            ))}
        </ScrollableFeed>
    )
}

export default ScrollableChat;