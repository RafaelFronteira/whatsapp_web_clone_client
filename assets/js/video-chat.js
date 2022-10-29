const video_call = document.getElementById('video_call');
const video_call_alert = document.getElementById('video_call_alert');
let OWNSTREAM;
let USERSTREAM;
let callReceived;

function getPermission() {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
}


function callUser(peerID) {

  getPermission().then((myStream) => {
    OWNSTREAM = myStream;
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
      USERSTREAM = stream;
      const otherVideoSection = document.getElementById('video-otheruser');
      const video = document.createElement("video");
      video.srcObject = stream;

      video.addEventListener('loadedmetadata', () => {
        console.log('add video do usuário, quando ele aceitar: ', video)
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
      USERSTREAM = stream;
      const otherVideoSection = document.getElementById('video-otheruser');
      const video = document.createElement("video");
      video.muted = true;
      video.srcObject = stream;

      video.addEventListener('loadedmetadata', () => {
        console.log('add video do usuário, quando eu aceitar: ', video)
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
  OWNSTREAM.getTracks().forEach(track => track.stop());
  USERSTREAM.getTracks().forEach(track => track.stop());

  video_call_alert.classList.add('hide');
  document.getElementById('video-user').innerHTML = "";
  document.getElementById('video-otheruser').innerHTML = "";


  if (!callReceived) return;

  try {
    callReceived.close();
  } catch (error) { }

  callReceived = null;
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
})();