
var alertSound = loadAudio('assets/alert.wav');

function playAlert() {
    alertSound.play();
}

var curSteps = 0;

var missions =
[
    {
        title:  "Wandering",
        summary: "Wandering in the maze",

        done: function() {
            return curSteps ++ == 40;
        }
    },

    {
        title:  "Find Selena!",
        startMessage:{ 
            title: "Find Selena!",
            text:   "OMG! Selena Gomez has a message for you. Find her in the maze to get the message.",
        },
        finishMessage:{ 
            title: "Message from Selena",
            text:   "Thanks for finding me. Now help me talk some sense into Justin. He's been getting some strange ideas about music lately.",
            image: 'assets/selena2.jpg',
        },
        summary: "Find Selena Gomez in the maze to get a message",

        done: function() {
            return match(nowPlayingArtist(), 'Selena Gomez & The Scene');
        }
    },

    {
        title:  "Find Justin!",
        finishMessage:{ 
            title: "Message from Justin",
            text:   "I'm thinking about trying a new music style. Could you tell Selena that I'm outta here?",
            image: 'assets/justin.jpg',
        },

        summary: "Find Justin in the maze",

        done: function() {
            return match(nowPlayingArtist(), 'Justin Bieber');
        },
        cleanup: function() { setTimeout(swapAndPlay, 8000); },
    },

    {
        title:  "Find Selena Again!",
        finishMessage:{ 
            title: "Message from Selena",
            text:   "It's the worst! Justin has left to join a death metal band!. Without Justin, my world is an empty place. Help me save Justin from the Death Metal!" ,
            image: 'assets/selena2.jpg',
        },

        summary: "Find Justin in the maze",

        done: function() {
            return match(nowPlayingArtist(), 'Selena Gomez & The Scene');
        },
    },
    {
        title:  "Save Justin from the Death Metal!",
        finishMessage:{ 
            title: "Message from Justin",
            text:   "Hey! I found out that it is really really hard to dance to death metal.  Selena wants me back? Cool. I'm on my way.",
            image: 'assets/justin.jpg',
        },

        summary: "Find Justin in the maze",

        done: function() {
            return match(nowPlayingArtist(), 'Justin Bieber');
        },
        cleanup: function() { setTimeout(swapJustinAndNile, 5000); },
    },
    {
        title:  "Save Justin from the Death Metal!",
        finishMessage:{ 
            title: "Message from Selena",
            text:   "Thanks for saving Justin from the Death Metal! Your melody will play on and on.",
            image: 'assets/selena2.jpg',
        },

        summary: "Find Justin in the maze",

        done: function() {
            return match(nowPlayingArtist(), 'Selena Gomez & The Scene');
        }
    },

    {
        summary: "Find Justin in the maze",

        done: function() {
            return false;
        }
    },
];


var missionIndex =  -1;
var currentMission = null;


function match(s1, s2) {
    return s1 === s2;
}

function missionMessage(msg) {
    if (msg) {
        playAlert();
        $.gritter.add( {'title': msg.title, 'text': msg.text, sticky:true, image:msg.image});
    }
}
function nextMission() {
    if (currentMission != null) {
        missionMessage(currentMission.finishMessage);
        if (currentMission.cleanup) {
            currentMission.cleanup();
        }
    }

    if (missionIndex < missions.length - 1) {
        missionIndex++;
        currentMission = missions[missionIndex];
        if (currentMission.startup) {
            currentMission.startup();
        }
        missionMessage(currentMission.startMessage);
    }
}

function swapAndPlay() {
    swapJustinAndNile();
    var song = findSongByArtist('Nile');
    song.play(false);
}

function updateMission() {
    if (currentMission == null || currentMission.done()) {
        nextMission();
    }
}




