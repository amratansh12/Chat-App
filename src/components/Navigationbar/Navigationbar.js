import { ChatState } from '../../Context/ChatProvider';
import { Navbar, Container, InputGroup, Button, Form, Dropdown, Offcanvas, Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserListItem from '../UserListItem/UserListItem';

// Bootstrap Modal 
function MyVerticallyCenteredModal(props) {
    const {user} = ChatState();

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
                <h4>{user.name}</h4>
                <img style={{borderColor:'black' ,height: '200px', width: 'auto', marginRight: '5px', borderRadius: '50%'}} src={user.profile} alt='profile pic'/>
            </Container>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='dark' onClick={props.onHide}>Close</Button>
        </Modal.Footer>
        </Modal>
    );
}

export default function Navigationbar(){
    const {user, setSelectedChat, chats, setChats} = ChatState(); 

    //modal states
    const [modalShow, setModalShow] = useState(false);
    const navigate = useNavigate();

    //Offcanvas states
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);

    //search States
    const[search, setSearch] = useState("");
    const[searchResult, setSearchResult] = useState([]);
    const[loading, setLoading] = useState(false);
    const[loadingChat, setLoadingChat] = useState(false);

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    }

    const handleSearch = () => {
        setLoading(true);
        fetch(`http://localhost:4000/api/user?search=${search}`, {
            method: 'get',
            headers: {Authorization : `Bearer ${user.token}`}
        }).then(res => res.json())
        .then(data => {
            setLoading(false);
            setSearchResult(data);
        })
        .catch(e => console.log)
    }

    const accessChat = (userId) => {
        setLoadingChat(true);
        fetch("http://localhost:4000/api/chat", {
            method: 'post',
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`   
            },
            body:JSON.stringify({userId})
        }).then(res => res.json())
        .then(data => {
            if(!chats.find((c) => c._id === data._id)){
                setChats([data, ...chats]);
            }
            setSelectedChat(data);
            setLoadingChat(false);
            setShow(false); //closing the side drawer
        }).catch(e => console.log(e));
    }

    return(
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" data-bs-theme="dark">
            <Container className='d-flex justify-content-around' fluid>
                <Container fluid>
                {user && 
                <InputGroup size='sm' className='w-50'>
                    <Button variant="light" id="button-addon2" onClick={()=>setShow(true)}>
                        Search User
                    <i style={{margin: '0px 5px'}} className="fa-solid fa-magnifying-glass"></i>
                    </Button>
                </InputGroup>}
                </Container>

                <Container>
                <Navbar.Brand className='mx-2' href="#">
                    IBYChats
                </Navbar.Brand>
                </Container>

                    
                {user && 
                <>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                <Container className="d-flex justify-content-between mx-5">

                <Dropdown>
                    <Dropdown.Toggle className='mx-2' variant="outline-light" id="dropdown-autoclose-true">
                    <img style={{height: '25px', width: 'auto', marginRight: '5px', borderRadius: '50%'}} src={user.profile} alt='profile pic'/>
                    {user.name}
                    </Dropdown.Toggle>

                    <Dropdown.Menu drop={'down-centered'}> 
                        <Dropdown.Item onClick={() => setModalShow(true)} href="#">My Profile</Dropdown.Item>
                        <Dropdown.Item onClick={logoutHandler} href="#">Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </Container>

                </Navbar.Collapse>

                </>}

            </Container>
            </Navbar>

            {user && <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
            />}

            {user && 
            <Offcanvas show={show} onHide={handleClose} backdrop={true}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Search Space</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <InputGroup className='mb-3'>
                        <Form.Control
                        placeholder="Search User"
                        aria-label="Search User"
                        aria-describedby="basic-addon2"
                        onChange={(event) => setSearch(event.target.value)}
                        />
                        <Button variant="dark" id="button-addon2" onClick={handleSearch}>
                        <i style={{margin: '0px 5px'}} className="fa-solid fa-magnifying-glass"></i>
                        </Button>

                    </InputGroup>

                    {
                        loading ? <Spinner /> : 
                        (
                            searchResult?.map(user => (
                                <UserListItem key={user._id} user={user} handleFunction={()=>accessChat(user._id)}/>
                            ))
                        )
                    }
                </Offcanvas.Body>
            </Offcanvas>}

            {loadingChat && <Spinner />}

        </>
    );
}