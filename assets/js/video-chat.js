const video_call = document.getElementById('video_call');
const video_call_alert = document.getElementById('video_call_alert');
let callReceived;

function getPermission() {
    return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
}


function callUser(peerID) {

  getPermission().then((myStream) => {
    const myVideoSection = document.getElementById('video-user');
    
    const myVideo = document.createElement("video");
    // myVideo.muted = true;
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
      video.muted = true;
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

function cancelCall() {

}

function aceeptCall() {
  video_call_alert.classList.add('hide');
  answerCall(callReceived);
}


function answerCall(call) {
  getPermission().then((myStream) => {
    const myVideoSection = document.getElementById('video-user');
    const myVideo = document.createElement("video");
    // myVideo.muted = true;
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


(() => {
  // receivind calls
  peer.on('call', (call) => {
    callReceived = call;
    video_call_alert.classList.remove('hide');
  });
})();