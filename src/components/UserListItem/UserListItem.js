import { Card, Container } from "react-bootstrap";

export default function UserListItem({user, handleFunction}){

    return(
        <Card style={{cursor: 'pointer'}} className="my-2" onClick={handleFunction}>
            <Container className="d-flex align-items-center p-2">
            <img src={user.profile} alt='profile pic' style={{height: '50px', borderRadius: '50%'}}/>
            <Card.Body>{user.name}</Card.Body>
            </Container>
        </Card>
    );
}

