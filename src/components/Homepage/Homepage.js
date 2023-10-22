import { useNavigate } from "react-router-dom";
import Register from "./Register";
import Signin from "./Signin";
import { Container, Button } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function Homepage(){

    const navigate = useNavigate();
    const [buttonState, setButtonState] = useState("login");
    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if(user){
            navigate('/chats');
        }
    },[navigate])

    const handleButton= (value) => setButtonState(value);

    return(
        <div>
            <Container className='my-2 d-flex justify-content-end' fluid>
                <Button variant="dark" className="mx-2" onClick={() => handleButton("login")}>Login</Button>
                <Button variant="dark" className="mx-2" onClick={() => handleButton("register")}>Register</Button>
            </Container>
            {
                (buttonState === "login") ? <Signin /> : <Register />
            }
        </div>
    );
}