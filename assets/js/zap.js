const URL = 'https://zapzapclone.herokuapp.com';
const socket = io(URL, { autoConnect: false });
const peer = new Peer();
const log = console.log.bind(document);
let audioRecordStartTime;
let usersOnline = []
let selectedUser = {};

function mergeArray(a, b) {
    let hash = {};
    
    for (let i = 0; i < a.length; i++) {
        hash[JSON.stringify(a[i])] = true;
    }

    for (let i = 0; i < b.length; i++) {
        hash[JSON.stringify(b[i])] = true;
    }
    return Object.keys(hash);
}

function listenerHandler() {
    const textAreaContent = document.getElementById('msg-content');
    textAreaContent.addEventListener('keydown', (event) => keyPressedHandler(event));
    
    
    document.getElementById('start_call').addEventListener('click', () => {
        callUser(selectedUser.user.peerID);
    });

    socket.onAny((event, ...args) => {
        log('Event: ', event);
        switch(event) {
            case 'users':
                const users = args[0];
                const online = users.filter(user => user.userID !== socket.userID);

                if (online.length > 0) {
                    online.forEach(user => addUserInContactList(user));
                    usersOnline = online;
                }

                break;
            case 'add user':
                const event = args[0];
                log('event: ', args[0])
                if (event) {
                    addUserInContactList(event.newUser);
                    usersOnline = mergeArray(usersOnline, event.usersOnline)
                                    .map(u => JSON.parse(u));
                }
                break;
            case 'private message':
                log('MSG: ', args[0])
                const messageInfo = args[0];

                renderMessage(messageInfo.from, messageInfo.content, messageInfo.type);
                notifyUser(messageInfo.from);

                break;
            
        }
    });
}

function notifyUser(userID) {
    const template = document.createElement('template');
    const userSection = document.getElementById(userID);
    const notificationSection = userSection.querySelector('#notification');

    if (!userSection.classList.contains('user_selected')) {
        const templateString = `
            <div id="notification_alert" class="user__contact__notification">
                <span>1</span>
            </div>
        `
        template.innerHTML = templateString.trim();
        notificationSection.appendChild(template.content.firstChild);
    }
}

function removeUserInContactList(id) {
    document.getElementById(id).remove();
}

function addUserInContactList(user) {
    const element = document.getElementById('contact_list');
    const template = document.createElement('template');

    const templateString = `
    <div id="${user.userID}" class="user__contact" onclick="onSelectUser(this)">
        <section class="user__contact__user-info">
            <div>
                <img src="./assets/images/other-user.jpeg" alt="user_image" />
            </div>
            <div style="margin: auto 0">
                <h1>${user.username}</h1>
                <p>Novo usuário</p>
            </div>
        </section>
        <section id="notification" style="display: flex; flex-direction: column; justify-content: center;"></section>
    </div>`;

    template.innerHTML = templateString.trim();
    element.appendChild(template.content.firstChild);
}

function startConversation(userID) {
    const user = usersOnline.find(user => user.userID === userID);
    
    if (user) {
        selectedUser.user = user;
        selectedUser.messages = sessionStorage.getItem(user.userID) || [];

        document.getElementById('receiver_name').innerHTML = user.username;
        document.getElementById('receiver_name').title = user.username;
        document.getElementById('private_chat').classList.remove('hide');
        document.getElementById(userID).querySelector('#notification_alert')?.remove();
        document.getElementById('messages_container').innerHTML = "";
    }
}

function onSelectUser(element) {
    const elements = document.querySelectorAll('.user_selected');
    elements.forEach(div => div.classList.remove('user_selected'));
    element.classList.add('user_selected');
    
    startConversation(element.id);
}

function sendMessage(content, type) {
    const to = selectedUser.user.userID;
    const time = new Date().getTime();   

    if (to) {
        socket.emit('private message', {
            content,
            time,
            type,
            to
        });
    }

    renderMessage(socket.userID, content, type);
}

function keyPressedHandler(event) {
    if (event.key.toLowerCase() === 'enter') {
        event.stopPropagation();
        event.preventDefault();

        const content = event.target.value;

        if (content && content.trim() !== '') {
            sendMessage(content, 'text');
            event.target.value = ""
        }
    }
    
    return;
}

function renderMessage(from, content, type) {
    const template = document.createElement('template');
    const messageContainer = document.getElementById('messages_container');
    let templateString = "";

    switch(type) {
        case "text":
            templateString = `
            <div class="message ${socket.userID === from ? 'sender': 'receiver'}">
                <span>${content}</span>
                <small>0:0</small>
            </div>`;
            break;
        case 'audio':
            templateString = `
            <div class="audio ${socket.userID === from ? 'sender': 'receiver'}">
                <section>
                    <span onclick="onHandlePlayer(this)">
                        <img id="play" src="./assets/images/play.svg" width="24" height="24" />
                        <img id="stop" class="hide" src="./assets/images/stop.svg" width="24"
                            height="24" />
                    </span>
                    <audio controls style="display: none;">
                        <source src="${content}" />
                    </audio>
                </section>
                <section style="display: flex; align-items: center; gap: 10px">
                    <span id="playing_indication" class="text-indication-playing hide">
                        playing <span>.</span><span>.</span><span>.</span>
                    </span>
                    <span style="cursor: default!important;">
                        <img style="cursor: default!important;" id="receiver_img"
                            src="${socket.userID === from ? './assets/images/user.jpeg': './assets/images/other-user.jpeg'}" 
                            alt="user_image" />
                    </span>
                </section>
                </div>
            `;
            break;
    }
    

    template.innerHTML = templateString.trim();
    messageContainer.appendChild(template.content.firstChild);
    messageContainer.scroll({top: messageContainer.scrollHeight, behavior: "smooth"});
}

function saveAudio(audioBlob) {
    const reader = new FileReader();

    reader.onload = (event) => {
        const base64 = event.target.result;
        sendMessage(base64, 'audio');
    };

    reader.readAsDataURL(audioBlob);
}

function audioOptionsElement() {
    return {
        showRecordingOpt: () => {
            const audioOptionsSection = document.getElementById('audio_options');
            const messageSection = document.getElementById('msg-content');

            messageSection.style.display = 'none';
            audioOptionsSection.querySelector('#mic').classList.add('hide');
            audioOptionsSection.querySelector('#trash').classList.remove('hide');
            audioOptionsSection.querySelector('#rec_msg').classList.remove('hide');
            audioOptionsSection.querySelector('#send').classList.remove('hide');
        },
        hideRecordingOpt: () => {
            const audioOptionsSection = document.getElementById('audio_options');
            const messageSection = document.getElementById('msg-content');

            messageSection.style.display = 'block';
            audioOptionsSection.querySelector('#mic').classList.remove('hide');
            audioOptionsSection.querySelector('#trash').classList.add('hide');
            audioOptionsSection.querySelector('#rec_msg').classList.add('hide');
            audioOptionsSection.querySelector('#send').classList.add('hide');
        }
    }
}

function recordAudioHandler() {
    return {
        startRecording: () => {
            audioRecorder.start().then(() => {
                audioOptionsElement().showRecordingOpt();
                console.log('Recording...');
            });
        },
        stopRecording: () => {
            audioRecorder.cancel();
            audioOptionsElement().hideRecordingOpt();
        },
        saveRecord: () => {
            audioRecorder.stop().then(audioAsBlob => {
                audioOptionsElement().hideRecordingOpt();
                saveAudio(audioAsBlob);
            });
        }
    }
}

function onHandlePlayer(event) {
    const playButton = event.querySelector('#play');
    const stopButton = event.querySelector('#stop');
    const audio = event.parentElement.querySelector('audio');
    const playingIndication = event.parentElement.parentElement.querySelector('#playing_indication');

    if (playButton.classList.contains('hide')) {
        stopButton.classList.add('hide');
        playingIndication.classList.add('hide');
        playButton.classList.remove('hide');

        // stop
        audio.pause();
    }
    else {
        playButton.classList.add('hide');
        stopButton.classList.remove('hide');
        playingIndication.classList.remove('hide');
        
        // play
        audio.play();
    }

}


(() => {
    const sessionID = sessionStorage.getItem('sessionID');
    const username = sessionStorage.getItem('username');

    if (username) {
        socket.on('session', ({ sessionID, userID }) => {
            socket.auth = { sessionID };
            socket.userID = userID;
            socket.username = username;
            
            sessionStorage.setItem("sessionID", sessionID);
        });
        
        if (sessionID) {
            socket.auth = { sessionID, username };
        } else {
            socket.auth = { username }
        }


        peer.on('open', (id) => {
            socket.auth['peerID'] = id;
            socket.connect();
        });
    } else {
        location.href = './index.html';
    }


    listenerHandler();
})();