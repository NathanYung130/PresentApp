import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { nanoid } from 'nanoid'
import MoreInfo from './MoreInfo';
import RulesCarousel from './RulesCarousel';
import { setUser, setRoomId, setSocketId} from '../Redux/roomSlice';
import './styles/Home.css'
//-----------------images-------------:
import designerImage from './images/clip-quest.png';
import Image2 from './images/raffle-nobg.png';
import Image3 from './images/thinking-nobg.png';
//------------------------------------:


const Home = ({ socket }) => {
    //++++++++Declare Variables++++++++\\
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Import useDispatch from 'react-redux'

    const [userName, setUserName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [createState, setCreateState] = useState(false);
    //+++++++++++++++++++++++++++++++++++\\

    //updates All front end based stores
    const updateStores = useCallback(() => {
        localStorage.setItem('userName', userName);
        localStorage.setItem('roomCode', roomCode);

        //Update Redux store with roomCode via dispatch action
        dispatch(setUser(userName));
        dispatch(setRoomId(roomCode));
        dispatch(setSocketId(socket.id));
    }, [userName, roomCode, dispatch, socket.id]);

    // Handle search buton press, emits to socket to check if room exists
    const handleSearch = () => {
        if ((roomCode.length < 6)) {
            handlePopup('roomError');
            return; // Prevent form submission if validation fails
        } else if(userName.length < 1){
            handlePopup('userNameError');
        } else{
            updateStores();
            socket.emit('queryRoom', { userName, roomCode});
        }
    };

    // Handle creation of room. emits to socket to check, the socket response
    // is then collected by useEffect, which handles the joining of the room
    const handleCreate = () =>{
        if (userName.length < 1) {
            handlePopup('userNameError');
            return; // Prevent form submission if validation fails
        } else{
            setCreateState(true);
            let TempId = nanoid(6);
            setRoomCode(TempId);
            updateStores();
            socket.emit('queryRoom', { userName, roomCode});
        }
    };

    // useEffect handles the output of listener functions that pull from socket.io
    useEffect(() => {
        const handleRoomNotFound = () => {
            if (createState){

                updateStores();
                socket.emit('joinRoom', { userName, roomCode, socketID: socket.id, firstUser: 1 });
                // socket.emit('createRoom', { userName, roomCode, socketID: socket.id });
                navigate(`/chat/${roomCode}`);
            }else{
                handlePopup('noRoom');
            }
        };
        const handleRoomFound = () => {
            socket.emit('joinRoom', { userName, roomCode, socketID: socket.id, firstUser: 0 });
            navigate(`/chat/${roomCode}`);
        };

        // Attach socket listeners
        socket.on('roomNotFound', handleRoomNotFound);
        socket.on('roomFound', handleRoomFound);

        return () =>{
            socket.off('roomNotFound', handleRoomNotFound);
            socket.off('roomFound', handleRoomFound);
        }

    }, [roomCode, navigate, createState, socket, updateStores, userName]);


    //========== Pop Up control: =============\\
    const [popup, setPopup] = useState(null);

    const handlePopup = (popupType) => {
      setPopup(popupType);
    };
  
    const closePopup = () => {
      setPopup(null);
    };
    //=========================================\\

    const [bannerVisible, setBannerVisible] = useState(false);

    // Scroll event listener to toggle banner
    useEffect(() => {
        const handleScroll = () => {
            const logoElement = document.querySelector('.logo');
            const logoPosition = logoElement?.getBoundingClientRect().top;
            
            if (logoPosition < 100) {
                setBannerVisible(true);
            } else {
                setBannerVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    //-----------------rules--------------//
    const rules = [
        {
            image: designerImage,
            text: "First everyone is prompted to answer a unique question about themselves."
        },
        {
            image: Image2,
            text: "Next, one of those questions will be chosen."
        },
        {
            image: Image3,
            text: "If that question is yours, sit tight! If it is not, your task is to submit an answer you think that person would have submitted."
        },
        {
            image: "/api/placeholder/400/300",
            text: "Voting will begin! If you chose correctly, both you and question answerer will receive 15 pts."
        },
        {
            image: "/api/placeholder/400/300",
            text: "Wrong choices will give 10 pts to the one that deceived you! Remember this is a game of deception!"
        },

    ]

    
// // ============ Logo Styling ===================\\
// const logo = document.querySelector('.logo');

// // Define the scroll threshold (adjust as needed)
// const threshold = 800; // pixels

// // Add event listener for scroll
// window.addEventListener('scroll', () => {
//   if (window.scrollY > threshold) {
//     logo.classList.add('light');
//   } else {
//     logo.classList.remove('light');
//   }
// });



    return (
        <>
        <div className = "JoeBoxLogin">
            <div className = "logocontainer">
                <h1 className = "logo">Joe-Box</h1>
            </div>
            
            <form className="home__container">
                <h2 className="home__header">Let's Play</h2>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    minLength={6}
                    name="username"
                    id="username"
                    className="username__input"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <label htmlFor="roomCode">Room Code</label>
                <input
                    type="text"
                    minLength={6}
                    name="roomCode"
                    id="roomCode"
                    className="roomcode__input"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                />
                <div className = "buttons">
                    <button className = "interaction" type = "button" onClick = {handleSearch}>Search Room</button>
                    <button className = "interaction"type = "button" onClick = {handleCreate}>Create Room</button>
                </div>
            </form>

            {popup && (
                <div className="popup">
                    <div className="popup-content">
                        <span className="close" onClick={closePopup}>&times;</span>
                        {popup === 'userNameError' &&
                        <div className= "popText">
                            <p>Enter a Username!</p>
                        </div>}
                        {popup === 'roomError' &&
                        <div className= "popText">
                            <p>Room Codes Must be At Least 6 Characters!</p>
                        </div>}
                        {popup === 'noRoom' &&
                        <div className= "popText">
                            <p>No Room Found!</p>
                        </div>}
                    </div>
                </div>
            )}

            <div className = "Rules">
                <h1>Rules:</h1>
                <RulesCarousel rules={rules} />
            </div>
        </div>
        <div className = "svgContainer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="1" d="M0,256L60,229.3C120,203,240,149,360,144C480,139,600,181,720,197.3C840,213,960,203,1080,197.3C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
        </div>
        <div className = "backroundContainer">
            <div className = "ExtraInfo">
                <MoreInfo/>
            </div>
        </div>
        </>
    );
};

export default Home;