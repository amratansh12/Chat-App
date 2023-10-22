import { useState } from 'react';
import { Container, Button, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useNavigate } from "react-router";

export default function Register() {
    const navigate = useNavigate();

    //toast state and methods
    const [showA, setShowA] = useState(false);
    const[toastMessage, setToastMessage] = useState();
    const[toastHeadingColor, setToastHeadingColor] = useState();
    const toggleShowA = () => {
        setLoading(false);
        setShowA(!showA)
    };

    //loading of profile pic state
    const[loading, setLoading] = useState(false);

    const[isHidden, setIsHidden] = useState(true);
    const[name, setName] = useState();
    const[email, setEmail] = useState();
    const[password, setPassword] = useState();
    const[profile, setProfile] = useState();

    function togglePasswordHiddenState(){
        if(isHidden === true){
            setIsHidden(false)
        }else setIsHidden(true)
    }

    function uploadPic(pic){
        setToastMessage('Please upload a valid jpeg or png image.');
        setToastHeadingColor('red');
        setLoading(true);
        if(pic === undefined){
            setShowA(true);
            return;
        }

        if(pic.type === 'image/jpeg' || pic.type === 'image/png'){
            const data = new FormData();
            data.append('file', pic);
            data.append('upload_preset', 'IBY-Chat-App');
            data.append('cloud_name', 'dutqfiuns');
            fetch('https://api.cloudinary.com/v1_1/dutqfiuns/image/upload', {
                method: 'post',
                body: data
            }).then(res => res.json())
            .then(data => {
                setToastHeadingColor('green');
                setToastMessage('Picture uploaded successfully.')
                setShowA(true);
                setProfile(data.url.toString());
                setLoading(false);
            }).catch(e => {
                console.log(e);
                setLoading(false);
            })
        }else{
            setShowA(true);
            setLoading(false);
        }
    }
    
    async function handleSubmit(){
        setLoading(true);

        if(!name || !email || !password){
            setToastHeadingColor('red');
            setToastMessage('Please enter a valid name, email or password.')
            setShowA(true);
            setLoading(false);
        }

        fetch('http://localhost:4000/api/user/register',{
            method: 'post',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                name, email, password, profile
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data); 
            localStorage.setItem('userInfo', JSON.stringify(data));
            setToastHeadingColor('green');
            setToastMessage('User registered successfully');
            setShowA(true);
            setLoading(false);
            navigate('/chats');
        })
        .catch(e => console.log(e.message));        
    }

    return (
        <Container>

        {/* Toast warnings */}
        <ToastContainer id='registerToast' position="bottom-end" className="p-3 position-absolute" style={{ zIndex: 1 }} >
        <Toast show={showA} onClose={toggleShowA}>
            <Toast.Header>
                <img
                    src="holder.js/20x20?text=%20"
                    className="rounded me-2"
                    alt=""
                />
                <strong className="me-auto" style={{color: toastHeadingColor}}>Attention</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
        </ToastContainer>

        {/* Form */}
        <form action="" className='container p-3 mt-5 w-50' style={{backgroundColor: 'white', borderRadius: '5px', boxShadow: '2px 2px 15px black'}} >
            <h2 className='my-2'>Register</h2>

            <FloatingLabel controlId="floatingInput" label="Name" className="mb-3">
                <Form.Control type="text" placeholder="name" onChange={(event) => setName(event.target.value)} required/>
            </FloatingLabel>

            <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3">
                <Form.Control type="email" placeholder="name@example.com" onChange={(event) => setEmail(event.target.value)} required/>
            </FloatingLabel>

            <FloatingLabel controlId="floatingInput" label="Password" className="mb-3">
                <Form.Control type={isHidden ? "password" : "text"} placeholder="password" onChange={(event) => setPassword(event.target.value)} required/>
                {isHidden 
                    ? 
                    <Button variant="dark mt-3" style={{fontSize: '10px'}} onClick={togglePasswordHiddenState}><Eye className='mx-1' size={20} style={{cursor: 'pointer'}}/>Show Password</Button> 
                    : 
                    <Button variant="dark mt-3" style={{fontSize: '10px'}} onClick={togglePasswordHiddenState}><EyeSlash className='mx-1' size={20} style={{cursor: 'pointer'}}/>Hide Password</Button>
                }
            </FloatingLabel>

            <Form.Control type="file" placeholder="profile" onChange={(event) => uploadPic(event.target.files[0])}/>

            <Button variant="dark mt-3 w-100" onClick={handleSubmit}>
                {(loading) && <Spinner size='sm' animation="border" variant="light" />}
                <span style={{display: loading ? 'none' : 'block'}}>Register</span>
            </Button>
        </form>
        </Container>
    );
}