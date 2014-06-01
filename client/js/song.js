


var songCount = 0;
var songAudio =  document.createElement('audio');
var curSong = null;

function createSongTile(song, pos, which) {
    var xscale = 1.00;
    var yscale = 1.00;
    var zscale = 1.00;

    var url = getBestImage(song.spotifyTrackInfo.album.images, 300).url;
    if (!url) {
        url = "images/missing.png";
    }

    var geometry	= new THREE.CubeGeometry( 1, 1, 1 );
    var material = new THREE.MeshLambertMaterial( 
        { ambient: 0xbbbbbb, map: THREE.ImageUtils.loadTexture('img?url=' + url) });
    var mesh = new THREE.Mesh( geometry, material );

    mesh.pos = pos;
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = -60;

    mesh.destination = {};
    mesh.destination.x = pos[0] * xscale;
    mesh.destination.y = pos[1] * yscale;
    mesh.destination.z = pos[2] * zscale;
    

    mesh.artist = song.artist_name;
    mesh.artist_id = song.artist_id;
    mesh.title = song.title;
    mesh.id = song.id;
    mesh.audio_url = song.spotifyTrackInfo.preview_url;
    mesh.cmds = []
    mesh.running = 0;

    mesh.play = play;
    mesh.stop = stop;
    mesh.addCmd = addCmd;
    mesh.runCmd = runCmd;
    mesh.tweak = tweak;
    mesh.worldPosition = worldPosition;
    mesh.which = songCount++;
    mesh.addCmd('position', mesh.destination, 4000, which * 100, TWEEN.Easing.Linear.EaseOut);
    return mesh;
}

function getBestImage(images, minWidth) {
    var best = images[0];
    images.forEach(
        function(image) {
            if (image.width >= minWidth && image.width <= best.width) {
                best = image;
            }
        }
    );
    return best;
}

function createMultiLevelSongTile(song, pos, which, height) {
    var parent = createSongTile(song, pos, which);
    var st = parent;
    for (var i = 1; i < height; i++) {
        var child = createSongTile(song, [0,1,0], which);
        st.add(child);
        st = child;
    }
    return parent;
}


function worldPosition(scene) {
     //scene.update();
     return new THREE.Vector3(
          this.matrixWorld.n14,
          this.matrixWorld.n24,
          this.matrixWorld.n34
     );
}


function tweak() {
    var oldPos = $.extend({}, this.destination);
    var tweakPos1 = {x:this.position.x, y:this.position.y + .4, z:this.position.z};
    var tweakPos2 = {x:this.position.x, y:this.position.y + .2, z:this.position.z};
    this.addCmd('position',  tweakPos1, 100, 0,  TWEEN.Easing.Linear.EaseNone, true);
    this.addCmd('position',  tweakPos2, 200, 0,  TWEEN.Easing.Linear.EaseNone, true);
    this.addCmd('position',  oldPos, 1600, 0,  TWEEN.Easing.Elastic.EaseOut, true);
}


function addCmd(source, target, time, delay, easing, wait, doneFunc) {
    var cmd ={}
    cmd.source = source;
    cmd.target = target;
    cmd.time = time === undefined ? 1000 : time;
    cmd.delay = delay === undefined ?  0 : delay;
    cmd.easing = easing === undefined ?  TWEEN.Easing.Elastic.EaseInOut : easing;
    cmd.wait = wait === undefined ? true : wait;
    cmd.doneFunc = doneFunc === undefined ?  null : doneFunc;

    this.cmds.push(cmd);
    //console.log('ac', cmd.wait, this.cmds.length, cmd.time, cmd.delay, this.running);
    this.runCmd();
}

function runCmd() {
    if (this.cmds.length > 0 && this.running == 0) {
        var cmd = this.cmds.shift();
        var that = this;
        if (cmd.wait) {
            that.running++;
        }
        function complete() {
            if (cmd.doneFunc) {
                cmd.doneFunc();
            }
            if (cmd.wait) {
                that.running--;
            }
            that.runCmd();
        }
        new TWEEN.Tween(this[cmd.source]).to(cmd.target, cmd.time)
             .easing( cmd.easing).delay(cmd.delay).onComplete(complete).start();
    }
}

function play(tweak) {
    tweak = tweak === undefined ? true : tweak;
    if (curSong !== this) {
        if (tweak) {
            this.tweak();
        }
        if (false) {
            songAudio.setAttribute('src', this.audio_url);
            songAudio.play();
        } else {
            audioPlay(this.audio_url);
        }
        showNowPlaying(this);
        curSong = this;
    }
}

function nowPlayingArtist() {
    if (curSong == null) {
        return "";
    } else {
        return curSong.artist;
    }
}

function stop() {
    if (this.audio) {
        this.audio.pause();
    }
}




