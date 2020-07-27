// call the root path which the server is set-up
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
//connection to peer server 
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
//dont want to listem to our own voice
myVideo.muted = true
const peers = {} //remember who is connected
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    //connect my video device
    addVideoStream(myVideo, stream)
    //when someone tries to call us, we send them our stream
    //receive call
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        //respond to video stram that comes in 
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    //allow video myself to be connect by another user
    //brodcast to everyone that a userID is connected to the room
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})
//if someone leaves
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})
//connect to the server and get back an id
myPeer.on('open', id => {
    //sent in the roomId and  userId to the server
    socket.emit('join-room', ROOM_ID, id)
})
//make call
function connectToNewUser(userId, stream) {
    //call a user with a certain ID
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    //when another user send their stream back
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    //when someone leaves the videocall, close that call
    call.on('close', () => {
        video.remove()
    })
    peers[userId] = call
}

function addVideoStream(video, stream) {
    //play our video in the stream
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}