import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { Modal ,Button, Col, Container, Row, Spinner, Card, Form, Toast, Badge, ToastContainer, Stack } from "react-bootstrap";
import { getSender } from "../Config/ChatLogics";
import axios from 'axios';
import UserListItem from "../UserListItem/UserListItem";

// Bootstrap Modal 
function MyVerticallyCenteredModal(props) {
    const {user, chats, setChats} = ChatState();
    //Group creation states
    const[groupChatName, setGroupChatName] = useState();
    const[selectedUsers, setSelectedUsers] = useState([]);
    const[search, setSearch] = useState();
    const[searchResults, setSearchResults] = useState([]);
    const[loading, setLoading]= useState(false);

    //Toast state
    const [showA, setShowA] = useState(false);
    const[toastMessage, setToastMessage] = useState("");

    const toggleShowA = () => setShowA(!showA);

    const handleSearch = (query) => {
        setSearch(query);

        if(!query){
            return;
        }

        setLoading(true);
        fetch(`http://localhost:4000/api/user?search=${search}`, {
            method: 'get',
            headers: {Authorization: `Bearer ${user.token}`}
        })
        .then(res => res.json())
        .then(data => {
            setLoading(false);
            setSearchResults(data);
        })
        .catch(e => console.log(e))
    }

    const handleSubmit = async () => {
        if(!groupChatName || !selectedUsers){
            setShowA(true);
            setToastMessage("Please select all the fields");
        }

        try {
            const config = {
                headers: {
                Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                `http://localhost:4000/api/chat/group`,
                {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            setChats([data, ...chats]);
            setToastMessage('Group created successfully')
            setShowA(true);
            props.onHide();
        } catch (error) {
        console.log(error.message)
        }
    }

    const handleDelete = (userToBeDeleted) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== userToBeDeleted._id))
    }

    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)){
            setShowA(true);
            setToastMessage("User already added")
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    }

    return (
        <>
        <ToastContainer className="m-5 position-absolute" position="bottom-start">
        <Toast show={showA} onClose={toggleShowA}>
          <Toast.Header>
            <strong className="me-auto">{toastMessage}</strong>
          </Toast.Header>
        </Toast>
        </ToastContainer>

        <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
            Create Group Chat
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Control className="my-2" placeholder="Enter group title" onChange={(e) => setGroupChatName(e.target.value)}></Form.Control>
            <Form.Control className="my-2 mb-3" placeholder="Add users" onChange={(e) => handleSearch(e.target.value)}></Form.Control>
            
            {/* Selected users */}
            {
            <Stack direction="horizontal" gap={2}>
            {selectedUsers.map(u => (
                <Badge key={u._id} bg='primary' >
                    {u.name}
                    <Button onClick={() => handleDelete(u)} size="sm"><i class="fa-solid fa-xmark"></i></Button>
                </Badge>
                
            ))}
            </Stack>
            }

            {/* Search results */}
            {loading ? <Spinner /> :
            searchResults?.slice(0,4).map(u => (
                <UserListItem key={u._id} user={u} handleFunction={()=>handleGroup(u)}/>
            ))
            }
        </Modal.Body>
        <Modal.Footer>
            <Button variant='dark' onClick={handleSubmit}>Create Group</Button>
        </Modal.Footer>
        </Modal>
        </>
    );
}

const MyChats = ({fetchAgain}) => {
    const {user, selectedChat, setSelectedChat, chats, setChats} = ChatState();

    const[loggedUser, setLoggedUser] = useState();

    //modal states
    const [modalShow, setModalShow] = useState(false);

    const fetchChats = () => {
        fetch("http://localhost:4000/api/chat", {
            method: 'get',
            headers: {Authorization: `Bearer ${user.token}`}
        }).then(res => res.json())
        .then(data => setChats(data))
        .catch(e => console.log(e.message))
    }

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
        // eslint-disable-next-line
    }, [fetchAgain])

    return(
        <Container style={{height: '88vh', borderRadius: '10px'}} className="bg-dark text-light br-3" fluid>
            <Row>
                <Col className="d-flex align-items-center p-2" ><h4>My Chats</h4></Col>
                <Col className="d-flex justify-content-end align-items-center p-2">
                    <Button variant="light" onClick={()=>setModalShow(true)}><i style={{marginRight:'5px'}} className="fa-solid fa-plus"></i>New Group Chat</Button>
                </Col>
            </Row>

            {user && <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />}
            
            {
            chats ? 
            (
            <Container style={{overflowY: 'scroll'}} fluid>
                {chats.map((chat)=>(
                    <Row className="my-2">
                    <Col>
                        <Card 
                        style={{cursor: 'pointer'}}
                        key={chat._id} 
                        onClick={() => setSelectedChat(chat)}
                        bg={selectedChat === chat ? "secondary" : "light"}
                        >
                            <Card.Body>{!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}</Card.Body>
                        </Card>
                    </Col>
                    </Row>
                ))}
            </Container>
            ) : <Spinner />
            }
        </Container>
    );
}

export default MyChats;