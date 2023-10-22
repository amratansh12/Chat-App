import './App.css';
import ParticlesBg from 'particles-bg'
import {
  Route,
  Routes,
} from "react-router-dom";
import Navigationbar from './components/Navigationbar/Navigationbar'
import ChatPage from './components/ChatPage/ChatPage';
import Homepage from './components/Homepage/Homepage';

function App() {
  return (
    <>
      <ParticlesBg type="cobweb" bg={true} num={100} />
      <Navigationbar />
      <Routes>
        <Route path="/" element={<Homepage />} exact/>
        <Route path="/chats" element={<ChatPage />} exact/>
      </Routes>
    </>
  );
}

export default App;
