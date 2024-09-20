import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux'

import StartGuide1 from "../StartGuideImg/StartGuide1.jpg";
import StartGuide2 from "../StartGuideImg/StartGuide2.jpg";
import StartGuide3 from "../StartGuideImg/StartGuide3.jpg";
import "../components/styles/MoreInfo.css";

const MoreInfo = () => {

    return (
        <div className = "moreInfoDiv">
            <h1>Start Guide</h1>
            <div className="How-To">
                <img src={StartGuide1} className="img1"/>
                <h3>
                    To start, Create a room by typing in a username and hitting CreateRoom!
                </h3>
                <img src={StartGuide2} className="img2"/>
                <h3>
                    Share your room code to others!
                </h3>
                <img src={StartGuide3} className="img1"/>
                <h3>
                    Join a room by hitting search, and you're off!
                </h3>
            </div>
            <div className = "AboutSection">
                <h1 className = "AboutTitle">Whats Joe-Box?</h1>
                <p>
                    The team behind Joe Box is a seattle based independent developer group founded by 2 university students
                    with a passion for computer science. Joe box is a multiplayer game platform providing easily
                    accessable free party games.
                </p>
                <p>
                     Our first game is called fibbage, a room based multiplayer game 
                    centered on getting to know other users! Equipped with a built in chat feature, Fibbage sponsors
                    a light hearted environment for users to have fun!
                </p>
            </div>

        </div>
    );
};

export default MoreInfo;
