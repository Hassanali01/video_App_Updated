import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import logo from '../Assets/images/Logo.png'

const CallPage = () => {
  const { id } = useParams(); // Extract call ID from URL
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [pc, setPC] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = () => {
      const firebaseConfig = {
        apiKey: "AIzaSyCxsZjE8xqTltmPyzMhTC3Ho1BvupBUu6Q",
        authDomain: "vediocallapp-bc493.firebaseapp.com",
        projectId: "vediocallapp-bc493",
        storageBucket: "vediocallapp-bc493.appspot.com",
        messagingSenderId: "481852095636",
        appId: "1:481852095636:web:aa2e66ca3daeeebe6a0881",
      };

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      setInitialized(true);
    };

    initializeFirebase();
  }, []);

  useEffect(() => {
    const initializeCall = async () => {
      const firestore = firebase.firestore();
      const callDoc = firestore.collection("calls").doc(id);
      const answerCandidates = callDoc.collection("answerCandidates");
      const offerCandidates = callDoc.collection("offerCandidates");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      const newPC = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
            ],
          },
        ],
        iceCandidatePoolSize: 10,
      });

      newPC.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      stream.getTracks().forEach((track) => {
        newPC.addTrack(track, stream);
      });

      newPC.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };

      const callData = (await callDoc.get()).data();
      const offerDescription = callData.offer;
      await newPC.setRemoteDescription(new RTCSessionDescription(offerDescription));

      const answerDescription = await newPC.createAnswer();
      await newPC.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await callDoc.update({ answer });

      offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            newPC.addIceCandidate(candidate);
          }
        });
      });

      setPC(newPC);
    };

    initializeCall();
  }, [id]);

  return (
    
     <div className="container mt-4">
     {/* <div className="section-border"> */}
       <div className="row">
         {/* <div className="col-md-1">
           <div className="sidebar">
             <a href="#home">
               <i className="fa fa-bell"></i>
             </a>
             <a href="#clients">
               <i className="fas fa-user-alt"></i>
             </a>
             <a href="#services">
               <i className="fa fa-calendar"></i>
             </a>
             <a href="#services">
               <i className="fa fa-calendar"></i>
             </a>
             <a href="#clients">
               <i className="fa fa-camera"></i>
             </a>
             <a href="#contact">
               <i className="fa fa-home"></i>
             </a>
           </div>
         </div> */}
         <div className="col-md-11">
           <div className="video-section">
             <div className="row">
               <div className="col-md-6 col-sm-6">
                 <div className="d-flex mt-3">
                   <div className="bg-secondary mx-3 heading-text " style={{display:"flex",justifyContent:"center",alignItems:'center'}}>
                    <img src={logo} style={{height:"33px"}}/>
                   </div>
                   <div className="mt-2 heading-video">
                     <h6>Welcome to your Anchorstech Video Call</h6>
                   </div>
                   {/* <div className="d-flex bg-secondary mx-1 rounded mx-2 heading-icons">
                     <i
                       className="fas fa-user-friends"
                       style={{
                         fontSize: "15px",
                         padding: "5px",
                         marginLeft: "10px",
                         marginTop: "2px",
                       }}
                     ></i>
                     <div>
                       <p className="mt-1">15+</p>
                     </div>
                   </div> */}
                 </div>
                 <hr></hr>
               </div>
               <div className="col-md-6 col-sm-6">
                 <div>
                   {/* <div className="d-flex mt-3 justify-content-end create-call-div">
                     <button
                       onClick={handleCallButtonClick}
                       id="callButton"
                       disabled={!localStream}
                       className="btn btn-light create-call"
                     >
                       Create Call (offer)
                     </button>
                     <div>
                       <button
                         onClick={handleWebcamButtonClick}
                         id="webcamButton"
                         className="btn btn-light mx-1 webcam"
                       >
                         <i
                           className="fa fa-camera"
                           style={{ fontSize: "24px", marginRight: "5px" }}
                         ></i>
                         Start webcam
                       </button>
                     </div>
                   </div> */}
                 </div>
               </div>
             </div>
             <div className="row">
               <div className="col-6">
               <video
          ref={(ref) => {
            if (ref) {
              ref.srcObject = localStream;
            }
          }}
          autoPlay
          playsInline
        ></video>
               </div>
               <div className="col-6">
                 <div>
                 <video
          ref={(ref) => {
            if (ref) {
              ref.srcObject = remoteStream;
            }
          }}
          autoPlay
          playsInline
        ></video>
                 </div>
               </div>
             </div>
             <div className="d-flex" style={{ marginLeft: "30px" }}>
               <div>
                 {/* <button className="btn btn-light ">
                   <i className="fas fa-video mx-2 join-call ">Join a call</i>
                 </button> */}
               </div>
             </div>
             <div className="mx-4 ">
               {/* <p className="font-text-join-call">
                 Answer the call from a different browser window or device
               </p> */}
               <div>
                 <div className="d-flex justify-content-between mb-2">
                   <span>
             
                     {/* <button
                       onClick={handleAnswerButtonClick}
                       id="answerButton"
                       className="btn btn-danger "
                       style={{marginLeft:'20px'}}
                     >
                       Join
                     </button> */}
 

                   </span>
                   <div className="hangup">
                     {/* <button id="hangupButton" className="btn btn-danger">
                       Hangup
                     </button> */}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       {/* </div> */}
     </div>
   </div>
  );
};

export default CallPage;
