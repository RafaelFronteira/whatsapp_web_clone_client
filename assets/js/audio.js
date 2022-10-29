
const audioRecorder = {
    
    audioBlobs: [],
    mediaRecorder: null,
    streamBeingCaptured: null,

    start: function () {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            //Feature is not supported in browser
            //return a custom error
            return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
        }
        else {
            //Feature is supported in browser
            return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                audioRecorder.streamBeingCaptured = stream;

                audioRecorder.mediaRecorder = new MediaRecorder(stream);

                audioRecorder.audioBlobs = [];

                audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                    audioRecorder.audioBlobs.push(event.data);
                });

                audioRecorder.mediaRecorder.start();
            })
            .catch(error => { //on error
                //No Browser Support Error
                    if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {       
                        console.log("To record audio, use browsers like Chrome and Firefox.");
                    //Error handling structure
                    switch (error.name) {
                        case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                            console.log("An AbortError has occured.");
                            break;
                        case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A NotAllowedError has occured. User might have denied permission.");
                            break;
                        case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A NotFoundError has occured.");
                            break;
                        case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A NotReadableError has occured.");
                            break;
                        case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                            console.log("A SecurityError has occured.");
                            break;
                        case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A TypeError has occured.");
                            break;
                        case 'InvalidStateError': //error from the MediaRecorder.start
                            console.log("An InvalidStateError has occured.");
                            break;
                        case 'UnknownError': //error from the MediaRecorder.start
                            console.log("An UnknownError has occured.");
                            break;
                        default:
                            console.log("An error occured with the error name " + error.name);
                    }
                }
            });
        }
    },
    /** Stop the started audio recording
      * @returns {Promise} - returns a promise that resolves to the audio as a blob file
      */
    stop: function () {
        return new Promise(resolve => {
            let mimeType = audioRecorder.mediaRecorder.mimeType;

            audioRecorder.mediaRecorder.addEventListener("stop", () => {
                let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType });

                resolve(audioBlob);
            });

            audioRecorder.mediaRecorder.stop();
            audioRecorder.stopStream();
            audioRecorder.resetRecordingProperties();
        });
    },
    /** Cancel audio recording*/
    cancel: function () {
        audioRecorder.mediaRecorder.stop();
        audioRecorder.stopStream();
        audioRecorder.resetRecordingProperties();
    },
    stopStream: function() {
        audioRecorder.streamBeingCaptured.getTracks().forEach(track => track.stop());
    },
    resetRecordingProperties: function() {
        audioRecorder.mediaRecorder = null;
        audioRecorder.streamBeingCaptured = null;
    }
}