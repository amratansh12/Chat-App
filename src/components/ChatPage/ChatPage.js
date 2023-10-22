import { Container, Row, Col } from "react-bootstrap";
import { ChatState } from "../../Context/ChatProvider";
import MyChats from "../Miscellaneous/MyChats";
import ChatBox from "../Miscellaneous/ChatBox";
import { useState } from "react";

const ChatPage = () => {
    const {user, selectedChat} = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    return(
        <Container className="p-3" fluid>
            <Row>
                <Col className={selectedChat && "d-lg-block d-none"} lg={4}>{user && <MyChats fetchAgain={fetchAgain}/>}</Col>
                <Col className={!selectedChat && "d-lg-block d-none"} lg={8}>{user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}</Col>
            </Row>    
        </Container>
    );
}

export default ChatPage