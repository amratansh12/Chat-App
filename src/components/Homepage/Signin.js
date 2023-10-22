import { useState } from 'react';
import { Container, Button, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

export default function Signin() {
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

  const[email, setEmail] = useState();
  const[password, setPassword] = useState();

  function handleSubmit(){
    setLoading(true);

    //if email or password is missing
    if(!email || !password){
      setToastHeadingColor('red');
      setToastMessage('Please enter a valid email or password.')
      setShowA(true);
      setLoading(false);
      return;
    }

    fetch('http://localhost:4000/api/user/',{
      method: 'post',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
          email, password
      })
    }).then(res => res.json())
    .then(data => {
      console.log(data); 
      localStorage.setItem('userInfo', JSON.stringify(data));
      setToastHeadingColor('green');
      setToastMessage('User signed in successfully');
      setShowA(true);
      setLoading(false);

      navigate('/chats');
    })
    .catch(e => {
      setToastHeadingColor('red');
      setToastMessage('Invalid email or password');
      setShowA(true);
      setLoading(false);
    });

    
  }

  return (
    <Container>
    {/* Toast Warnings */}
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

    <form action="" className='container p-3 mt-5 w-50' style={{backgroundColor: 'white', borderRadius: '5px', boxShadow: '2px 2px 15px black'}}>
        <h2 className='my-2'>Sign In</h2>

        <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3">
            <Form.Control type="email" placeholder="name@example.com" onChange={(event) => setEmail(event.target.value)} required/>
        </FloatingLabel>

        <FloatingLabel controlId="floatingInput" label="Password" className="mb-3">
            <Form.Control type="password" placeholder="password" onChange={(event) => setPassword(event.target.value)} required/>
        </FloatingLabel>

        <Button variant="dark mt-2 w-100" onClick={handleSubmit}>
          {(loading) && <Spinner size='sm' animation="border" variant="light"/>}
          <span style={{display: loading ? 'none' : 'block'}}>Sign In</span>
        </Button>
    </form>
    </Container>
  );
}