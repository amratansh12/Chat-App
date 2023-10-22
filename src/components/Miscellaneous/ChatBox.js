import { Container } from "react-bootstrap";
import { ChatState } from "../../Context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({fetchAgain, setFetchAgain}) => {
    const {selectedChat} = ChatState();

    return(
        <Container style={{height: '88vh', borderRadius: '10px'}} className="bg-dark text-light p-2" fluid>
            {selectedChat ? 
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> :
            <Container className="d-flex h-100 justify-content-center align-items-center"><h5>Click on a user to start chatting</h5></Container>}
        </Container>
    );
}

export default ChatBox;