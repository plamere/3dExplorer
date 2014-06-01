var audio = new Audio();

function initAudio() {
    audioReady();
}

function audioPlay(mp3) {
    audio.pause()
    audio.src = mp3;
    audio.play();
}

function audioCleanup() {
    audio.pause();
}

function audioPause() {
    audio.pause();
}

function audioResume() {
    audio.play();
}

function audioMute() {
    audio.volume = 0;
}

function audioUnMute() {
    audio.volume = 1;
}
