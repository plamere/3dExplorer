THREE.MazeControls	= function(camera, scene, maze, domElement) {
	this.camera	= camera;
    this.scene = scene;
    this.maze = maze;
	this._domElement= domElement || document;
    this.thunk = loadAudio('assets/thunk2.wav');

    this.RIGHT_ARROW = 39;
    this.LEFT_ARROW=37;
    this.UP_ARROW =38;
    this.DOWN_ARROW=40;
    this.SPACE=32;
    this.UP_KEY = 'W'.charCodeAt(0);
    this.DOWN_KEY = 'S'.charCodeAt(0);
    this.LEFT_KEY = 'A'.charCodeAt(0);
    this.RIGHT_KEY = 'D'.charCodeAt(0);
    this.TOP_VIEW_KEY = 'T'.charCodeAt(0);
    this.NORMAL_VIEW_KEY = 'N'.charCodeAt(0);
    this.compass = 0;

    this.cameraHeight = .65;
    this.jumping = false;

    this.handlers = {}

    this.xpos = 0;
    this.zpos = 0;
    this.ypos = 0;

    // go to the starting point. Since the camera doesn't have a width like
    // song cubes do, we have to futz with the position a bit
    var mazeStartingPoint = maze.getStartingPoint();
    var startingPos = maze.mazePosToWorld(mazeStartingPoint);
    this.llgoPos(startingPos.x -.5, startingPos.y -.5, startingPos.z -.5);


	var _this	= this;
	this._$onKeyDown	= function(){ _this._keyDown.apply(_this, arguments); };
    $(this._domElement).keydown( this._$onKeyDown);
    $(this._domElement).keyup( this._$onKeyUp);
    $('#artist').text(this.artist);
    $('#title').text(this.title);
}

function loadAudio(url) {
    var audio = document.createElement('audio');
    audio.setAttribute('src', url);
    return audio;
}





THREE.MazeControls.prototype._keyDown = function (event) {
    if (this.topView) {
        this.viewFromTheFloor();
        this.topView = false;
        return;
    }

    if (event.keyCode in this.handlers) {
        this.handlers[event.keyCode]();
    }

    if (event.keyCode == this.RIGHT_ARROW) {
        this.rotate(-1);
    }
    if (event.keyCode == this.LEFT_ARROW) {
        this.rotate(1);
    }

    if (event.keyCode == this.UP_ARROW || event.keyCode == this.UP_KEY) {
        this.move(-1.0);
    }

    if (event.keyCode == this.DOWN_ARROW ||event.keyCode == this.DOWN_KEY) {
        this.move(1.0);
    }

    if (event.keyCode == this.LEFT_KEY) { 
        this.offAxisMove(-1.0);
    }

    if (event.keyCode == this.RIGHT_KEY) { 
        this.offAxisMove(1.0);
    }

    if (event.keyCode == this.TOP_VIEW_KEY) {
        this.lookDown();
        this.topView = true;
    }

    if (event.keyCode == this.SPACE) {
        this.jump();
    }

    updateMission();
}

THREE.MazeControls.prototype.rotate = function(direction, delay) {
    delay = delay === undefined ? 0 : delay;
    this.compass += direction;

    var angle = (Math.PI / 2) * this.compass;
    var target = { x:0, y:angle, z:0};
    new TWEEN.Tween(this.camera.rotation).to(target, 500)
         .easing( TWEEN.Easing.Quadratic.EaseOut).delay(delay).start();
}

THREE.MazeControls.prototype.lookDown = function() {
    var target = { x:0, y: 60, z:0 };
    //var rtarget = { x: -Math.PI / 2};
    var rtarget = { x: -Math.PI / 2, y:0, z: -Math.PI / 2  };
    new TWEEN.Tween(this.camera.rotation).to(rtarget, 1500)
         .easing( TWEEN.Easing.Quadratic.EaseOut).start();
    new TWEEN.Tween(this.camera.position).to(target, 4000)
         .easing( TWEEN.Easing.Quadratic.EaseOut).delay(400).start();
}

THREE.MazeControls.prototype.jump = function() {
    if (!this.jumping) {
        var that = this;
        this.jumping = true;
        var starget = {  y: 4, };
        var ttarget = {  y: this.cameraHeight, };
        //var rtarget = { x: -Math.PI / 2};
        var upTween = new TWEEN.Tween(this.camera.position).to(starget, 1000)
             .easing( TWEEN.Easing.Quadratic.EaseOut).delay(0);
        var downTween = new TWEEN.Tween(this.camera.position).to(ttarget, 2000)
             .easing( TWEEN.Easing.Bounce.EaseOut).delay(0).
                onComplete(function(){ that.jumping = false;});
        upTween.chain(downTween);
        upTween.start();
    }
}


THREE.MazeControls.prototype.viewFromTheFloor = function() {
    this.llgoPos(this.xpos, this.ypos, this.zpos);
    this.rotate(0, 300);
}

THREE.MazeControls.prototype.llmove = function (distance, compassOffset) {
    var scale = 1;
    var ncompass = (this.compass + compassOffset) % 4;
    var xpos = this.xpos;
    var ypos = this.ypos;
    var zpos = this.zpos;
    if (ncompass == 0) {
        zpos += distance;
    } else if (ncompass == 2 || ncompass == -2) {
        zpos -= distance;
    } else if (ncompass == 1 || ncompass == -3) {
        xpos += distance;
    } else if (ncompass == 3 || ncompass == -1) {
        xpos -= distance;
    }

    this.llgoPos(xpos, ypos, zpos);
}

THREE.MazeControls.prototype.llgoPos = function (xpos, ypos, zpos) {
    var target = { x: xpos + .5, y:ypos + this.cameraHeight, z:zpos + .5};
    var mazePos = maze.worldPosToMaze(target);
    var moveOK = maze.isVisitable(mazePos[0], mazePos[1]);
    if (moveOK) {
    //console.log(this.compass, ncompass, this.camera.position.x, this.camera.position.z);
        //console.log('rc move', this.xpos, this.zpos);
        new TWEEN.Tween(this.camera.position).to(target, 1000)
             .easing( TWEEN.Easing.Quadratic.EaseOut).start();
        this.xpos = xpos;
        this.ypos = ypos;
        this.zpos = zpos;
    } else {
        var contents = maze.get(mazePos[0], mazePos[1]);
        if (contents && 'play' in contents) {
            contents.play();
        } else {
            //this.thunk.play();
        }
        this.thunk.play();
    }
}

THREE.MazeControls.prototype.offAxisMove = function (distance) {
    this.llmove(distance, 1);
}

THREE.MazeControls.prototype.move = function (distance) {
    this.llmove(distance, 0);
}


THREE.MazeControls.prototype.addKeyPressedHandler = function(key, func) {
    var code = key.charCodeAt(0);
    this.handlers[code] = func;
}



THREE.MazeControls.prototype.update	= function(event) {
}

