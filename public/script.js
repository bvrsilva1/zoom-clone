const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const currentVideo = document.createElement('video')
currentVideo.muted = true

// var peer = new Peer(undefined, {
//   path: '/peerjs',
//   host: '/',
//   port: '3030',
// })

var peer = new Peer()

let videoStream
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    videoStream = stream
    addVideoStream(currentVideo, stream)

    peer.on('call', (call) => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream)
    })

    let message = $('input')

    $('html').keydown((e) => {
      if (e.which === 13 && message.val().length !== 0) {
        socket.emit('message', message.val())
        message.val('')
      }
    })

    socket.on('createMessage', (message) => {
      $('ul').append(`<li class='message'><b>user</b><br/>${message}</li>`)
      scrollToBottom()
    })
  })

peer.on('open', (id) => {
  console.log('userId --> ', id)
  socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
  console.log('new user arrived -> ', userId)
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream)
  })
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

const scrollToBottom = () => {
  let chatWindow = $('.main__chat_window')
  chatWindow.scrollTop(chatWindow.prop('scrollHeight'))
}

const setMuteButton = () => {
  const muteIcon = `<i class='fas fa-microphone'></i><span>Mute</span>`
  document.querySelector('.main__mute_button').innerHTML = muteIcon
}

const setUnmuteButton = () => {
  const unmuteIcon = `<i class='fas fa-microphone-slash'></i><span>Unmute</span>`
  document.querySelector('.main__mute_button').innerHTML = unmuteIcon
}

const setStopVideoButton = () => {
  const stopVideoIcon = `<i class="fas fa-video"></i><span>Stop Video</span>`
  document.querySelector('.main__stop_video_button').innerHTML = stopVideoIcon
}

const setStartVideoButton = () => {
  const startVideoIcon = `<i class="fas fa-video-slash"></i><span>Start Video</span>`
  document.querySelector('.main__stop_video_button').innerHTML = startVideoIcon
}

const muteUnmute = () => {
  const enabled = videoStream.getAudioTracks()[0].enabled
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    videoStream.getAudioTracks()[0].enabled = true
    setMuteButton()
  }
}

const stopStartVideo = () => {
  const enabled = videoStream.getVideoTracks()[0].enabled
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false
    setStartVideoButton()
  } else {
    videoStream.getVideoTracks()[0].enabled = true
    setStopVideoButton()
  }
}
