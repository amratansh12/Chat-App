import { Badge, Button, Container, Form, InputGroup, Modal, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { ChatState } from "../../Context/ChatProvider";
import { getSender, getSenderOtherProfile } from "../Config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import UserListItem from "../UserListItem/UserListItem";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";

function SingleChatModal(props) {
    const {user, selectedChat} = ChatState();

    return (
        <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
            User Profile
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Container className=' my-3 d-flex flex-column justify-content-center align-items-center'>
                <h4>{getSenderOtherProfile(user, selectedChat.users).name}</h4>
                <img style={{borderColor:'black' ,height: '200px', width: 'auto', marginRight: '5px', borderRadius: '50%'}} src={getSenderOtherProfile(user, selectedChat.users).profile} alt='profile pic'/>
                <h5 className="my-2">Email : <Badge bg='secondary'>{getSenderOtherProfile(user, selectedChat.users).email}</Badge></h5>
            </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='dark' onClick={props.onHide}>Close</Button>
        </Modal.Footer>
        </Modal>
    );
}

function GroupChatModal({show, onHide, fetchAgain, setFetchAgain, fetchMessages}) {
    const {user, selectedChat, setSelectedChat} = ChatState();
    
    //Toast states
    const [showA, setShowA] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const toggleShowA = () => setShowA(!showA);

    const[groupChatName, setGroupChatName] = useState();
    const[search, setSearch] = useState("");
    const[searchResult, setSearchResult] = useState([]);
    const[loading, setLoading] = useState(false);
    const[renameLoading, setRenameLoading] = useState(false);

    const handleRemove = async(userToRemove) => {
        if(selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id){
            setToastMessage('Only admins can remove a user');
            setShowA(true);
            return;
        }

        try{
            setLoading(true);
            const config = {
                headers: {Authorization: `Bearer ${user.token}`}
            }

            const {data} = await axios.put("http://localhost:4000/api/chat/remove", {
                chatId: selectedChat._id,
                userId: userToRemove._id
            }, config)

            userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        }catch(error){
            console.log(error.message);
        }
    }

    const handleRename = async () => {
        if(!groupChatName) return;

        try{
            setRenameLoading(true);

            const config = {
                headers: {Authorization : `Bearer ${user.token}`}
            }

            const {data} = await axios.put("http://localhost:4000/api/chat/rename", {
                chatId: selectedChat._id,
                chatName: groupChatName
            },config)
            
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        }catch(error){
            console.log(error.message);
        }

        setGroupChatName("");
    }

    const handleSearch = async(query) => {
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
            setSearchResult(data);
        })
        .catch(e => console.log(e))
    }

    const handleAddUser = async(userToAdd) => {
        if(selectedChat.users.find(u => u._id === userToAdd._id)){
            setToastMessage("User already in the group");
            setShowA();
            return;
        }

        if(selectedChat.groupAdmin._id !== user._id){
            setToastMessage("Only admins can add a user")
            setShowA(true);
            return;
        }

        try{
            setLoading(true);

            const config = {
                headers: {Authorization: `Bearer ${user.token}`}
            }

            const {data} = await axios.put("http://localhost:4000/api/chat/groupAdd", {
                chatId: selectedChat._id,
                userId: userToAdd._id
            }, config)

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        }catch(error){
            console.log(error.message);
        }

    }

    return (
        <>
        <ToastContainer className="m-2" position="bottom-start">
        <Toast onClose={toggleShowA} show={showA} animation={false}>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">{toastMessage}</strong>
          </Toast.Header>
        </Toast>
        </ToastContainer>
        <Modal
        show={show}
        onHide={onHide}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
                <strong>{selectedChat.chatName}</strong>
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Container className=' my-3 d-flex flex-column justify-content-center align-items-center'>
                <h5>Users</h5>
                <Container className="d-flex flex-wrap">
                {selectedChat.users.map(u => (
                    <>
                    <Badge className="m-1" key={u._id}>
                        {u.name}
                        <Button size="sm" onClick={()=>handleRemove(u)}>
                        <i class="fa-solid fa-xmark fa-xs"></i>
                        </Button>
                    </Badge>
                    </>
                ))}
                </Container>

                {/* Renaming chat */}
                <InputGroup className="my-2">
                <Form.Control
                placeholder="Rename Chat"
                aria-label="Rename Chat"
                aria-describedby="basic-addon2"
                onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button variant="outline-dark" id="button-addon2" onClick={() => handleRename()}>
                    {renameLoading ? <Spinner variant="dark"></Spinner> : "Rename"}
                </Button>
                </InputGroup>

                {/* Adding user */}
                <Form.Control
                placeholder="Add user"
                aria-label="Add user"
                aria-describedby="basic-addon2"
                onChange={(e) => handleSearch(e.target.value)}
                />

                {/* Displaying all selected users */}
                <Container fluid>
                {
                loading ? <Spinner variant="dark" /> :
                searchResult?.slice(0,3).map(u => (
                    <UserListItem key={user._id} user={u} handleFunction={() => handleAddUser(u)} />
                ))
                }
                </Container>
            </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='danger' onClick={() => handleRemove(user)}>Leave Group</Button>
        </Modal.Footer>
        </Modal>
        </>
    );
}

const ENDPOINT = "http://localhost:4000";
var socket;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const[messages, setMessages] = useState([]);
    const[loading, setLoading] = useState(false);
    const[newMessage, setNewMessage] = useState();
    const[socketConnected, setSocketConnected] = useState(false);

    //modal states
    const [modalShowA, setModalShowA] = useState(false); //profile
    const [modalShowB, setModalShowB] = useState(false); //group chat

    const {user, selectedChat, setSelectedChat} = ChatState();

    const fetchMessages = async() => {
        if(!selectedChat) return;

        try{
            const config = {
                headers: {Authorization: `Bearer ${user.token}`}
            };

            setLoading(true);

            const {data} = await axios.get(`http://localhost:4000/api/message/${selectedChat._id}`, config)

            setMessages(data);
            setLoading(false);

            socket.emit('join chat', selectedChat._id);
        }catch(error){
            console.log(error.message);
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', user);
        socket.on('connection', () => setSocketConnected(true))
    }, [])

    useEffect(() => {
        fetchMessages();

        //eslint-disable-next-line
    }, [selectedChat])

    const sendMessage = async(e) => {
        if(e.key === 'Enter' && newMessage){
            try{
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                };

                setNewMessage("");
                const {data} = await axios.post("http://localhost:4000/api/message", {
                    content: newMessage,
                    chatId: selectedChat._id,
                }, config)

                socket.emit('new message', data);
                setMessages([...messages, data]);
            }catch(e){
                console.log(e);
            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing logic here
    }

    return(
        <Container fluid>
            <Container className='d-flex justify-content-between align-items-center'>
                <Button onClick={() => setSelectedChat("")} className="d-lg-none" variant="secondary"><i className="fa-solid fa-arrow-left"></i></Button>
                {selectedChat.isGroupChat ? 
                <>
                    <h4>{selectedChat.chatName}</h4>  
                    <Button onClick={() => {
                        setModalShowB(true);
                    }} variant="secondary"><i className="fa-regular fa-eye"></i></Button>
                </> : 
                <>
                    <h4>{getSender(user, selectedChat.users)}</h4>
                    <Button onClick={() => {
                        setModalShowA(true);
                    }} variant="secondary"><i className="fa-regular fa-eye"></i></Button>
                </>
                }
                
                {user && <SingleChatModal
                    show={modalShowA}
                    onHide={() => setModalShowA(false)}
                />}

                {user && <GroupChatModal
                    show={modalShowB}
                    onHide={() => setModalShowB(false)}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                />}
            </Container>

            {/* Messages here */}
            <Container style={{height: '78vh', borderRadius: '10px'}} className="mx-0 my-2 p-3 bg-light text-dark" fluid>
                {loading ? 
                <Container style={{height: '70vh'}} className="d-flex justify-content-center align-items-center"><Spinner className="align-self-center" variant="dark"/></Container> : 
                (<Container style={{height: '70vh'}} className="d-flex flex-column" gap={2}>
                    <ScrollableChat messages={messages} />
                </Container>)
                }

                <InputGroup>
                    <Form.Control
                    placeholder="Type message"
                    aria-label="Type message"
                    aria-describedby="basic-addon2"
                    onKeyDown={sendMessage}
                    required
                    onChange={typingHandler}
                    value={newMessage}
                    />
                    <Button variant="dark" id="button-addon2"><i className="fa-solid fa-paper-plane"></i></Button>
                </InputGroup>
            </Container>
        </Container>
    );
}

export default SingleChat