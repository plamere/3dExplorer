var audio = null;

function initAudio() {
    soundManager.url = 'js/';
    soundManager.flashLoadTimeout = 10000;

    soundManager.onready(function() {
        audioReady();
    });

    soundManager.ontimeout(function(status) {
        error("SM2 error. Is flash blocked or missing? The status is "  
            + status.success + ', the error type is ' + status.error.type);
    });
}

function audioPlay(mp3) {
    if (mp3 != null) {
        audioCleanup();               // stop the previous play
        audio = soundManager.createSound({ id: 'sound', url: mp3, });
        audio.play();
    } 
}

function audioCleanup() {
    if (audio) {
        audio.pause();
        audio.destruct();
        audio = null;
    }
}

function audioPause() {
    if (audio) {
        audio.pause();
    }
}

function audioResume() {
    if (audio) {
        audio.resume();
    }
}

function audioMute() {
    soundManager.mute();
}

function audioUnMute() {
    soundManager.unmute();
}
