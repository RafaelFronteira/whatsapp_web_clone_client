const video_call = document.getElementById('video_call');
const video_call_alert = document.getElementById('video_call_alert');
let OWNSTREAM;
let callReceived;
let usersSelectedID;

function getPermission() {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
}


function callUser(peerID, userID) {

  getPermission().then((myStream) => {
    OWNSTREAM = myStream;
    usersSelectedID = userID;
    const myVideoSection = document.getElementById('video-user');
    
    const myVideo = document.createElement("video");
    myVideo.muted = true;
    myVideo.srcObject = myStream;
    myVideo.addEventListener('loadedmetadata', () => {
      myVideoSection.appendChild(myVideo);
      video_call.classList.remove('hide');
      myVideo.play();
    });

    // make the call
    const call = peer.call(peerID, myStream);

    call.on("stream", (stream) => {
      const otherVideoSection = document.getElementById('video-otheruser');
      const video = document.createElement("video");
      video.srcObject = stream;

      video.addEventListener('loadedmetadata', () => {
        const hasVideo = otherVideoSection.hasChildNodes();
        if (!hasVideo) {
          otherVideoSection.appendChild(video);
          video.play();
        }
      });

    });

  });
}

function answerCall(call) {
  getPermission().then((myStream) => {
    OWNSTREAM = myStream;
    const myVideoSection = document.getElementById('video-user');
    const myVideo = document.createElement("video");
    myVideo.srcObject = myStream;

    myVideo.addEventListener('loadedmetadata', () => {
      myVideoSection.appendChild(myVideo);
      video_call.classList.remove('hide');
      myVideo.play();
    });

    call.answer(myStream);

    call.on("stream", (stream) => {
      const otherVideoSection = document.getElementById('video-otheruser');
      const video = document.createElement("video");
      video.muted = true;
      video.srcObject = stream;

      video.addEventListener('loadedmetadata', () => {
        const hasVideo = otherVideoSection.hasChildNodes();
        if (!hasVideo) {
          otherVideoSection.appendChild(video);
          video.play();
        }
      });
    });
  });
}

function endCall() {
  if (OWNSTREAM) {
    OWNSTREAM.getTracks().forEach(track => track.stop());
    video_call_alert.classList.add('hide');
    document.getElementById('video-user').innerHTML = "";
    document.getElementById('video-otheruser').innerHTML = "";
  
    socket.emit('private endcall', { to: usersSelectedID});
  
    if (!callReceived) return;
  
    try {
      callReceived.close();
    } catch (error) { }
  
    callReceived = null;
    OWNSTREAM = null;
  }

}

function aceeptCall() {
  video_call_alert.classList.add('hide');
  answerCall(callReceived);
}

function closeCall() {
  video_call.classList.add('hide');
  endCall();
}


(() => {
  // receivind calls
  peer.on('call', (call) => {
    callReceived = call;
    document.getElementById("user-request-call").innerHTML = socket.username;
    video_call_alert.classList.remove('hide');
  });


  socket.on('private endcall', () => {
    closeCall()
  });
})();