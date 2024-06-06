import React, { useEffect, useState } from "react";
import "../App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import logo from '../Assets/images/Logo.png'
const Mainpage = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [pc, setPC] = useState(null);
  const [callInputValue, setCallInputValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [firestore, setFirestore] = useState(null); 
  const [callLink, setCallLink] = useState("");

  // const firestore = firebase.firestore();

  useEffect(() => {
    const initializeFirebase = () => {
      const firebaseConfig = {
        // Your Firebase config
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
      setFirestore(firebase.firestore()); // Initialize firestore
      setInitialized(true);
    };

    initializeFirebase();
  }, []);
  // useEffect(() => {
  //   if (initialized) {
  //     // Access Firestore after Firebase is initialized
  //     const firestore = firebase.firestore();

  //     // Your Firestore-related logic here
  //   }
  // }, [initialized]);

  const handleWebcamButtonClick = async () => {
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

    setPC(newPC);
  };

  const handleCallButtonClick = async () => {
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    setCallInputValue(callDoc.id);

    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
    const callLink = `${window.location.origin}/call/${callDoc.id}`;
    console.log("callLink",callLink)
    setCallLink(callLink);
  };

  const handleAnswerButtonClick = async () => {
    const callId = callInputValue;
    const callDoc = firestore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);
    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

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
                    <div className="d-flex mt-3 justify-content-end create-call-div">
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
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-6">
                  <video
                    id="webcamVideo"
                    className="webcamVideo"
                    autoPlay
                    playsInline
                  ></video>
                </div>
                <div className="col-6">
                  <div>
                    <video
                      id="remoteVideo"
                      className="remoteVideo"
                      autoPlay
                      playsInline
                    ></video>
                  </div>
                </div>
              </div>
              <div className="d-flex" style={{ marginLeft: "30px" }}>
                <div>
                  <button className="btn btn-light ">
                    <i className="fas fa-video mx-2 join-call ">Join a call</i>
                  </button>
                </div>
              </div>
              <div className="mx-4 ">
                <p className="font-text-join-call">
                  Answer the call from a different browser window or device
                </p>
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>
                      <input
                        value={callLink}
                        onChange={(e) => setCallInputValue(e.target.value)}
                        id="callInput"
                        className="input"
                      />
                      <button
                        onClick={handleAnswerButtonClick}
                        id="answerButton"
                        className="btn btn-danger "
                        style={{marginLeft:'20px'}}
                      >
                        Join
                      </button>
                      {callLink && (
  <div className="alert alert-info mt-3" role="alert">
    Call link generated: <a href={callLink}>{callLink}</a>
  </div>
)}

                    </span>
                    <div className="hangup">
                      <button id="hangupButton" className="btn btn-danger">
                        Hangup
                      </button>
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

export default Mainpage;
