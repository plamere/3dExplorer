THREE.RotateControls	= function(camera, scene, domElement)
{
	this.camera	= camera;
    this.scene = scene;
	this._domElement= domElement || document;
    this.cameraTarget = new THREE.Vector3(0,0,0);
    this.resetCameraTarget = new THREE.Vector3(0,0,0);

    this.RIGHT_ARROW = 39;
    this.LEFT_ARROW=37;
    this.UP_ARROW =38;
    this.DOWN_ARROW=40;

    this.MOVE_FORWARD_KEY=87;
    this.MOVE_BACK_KEY=83;
    this.STRAFE_LEFT=65;
    this.STRAFE_RIGHT=68;
    this.STRAFE_UP=90;
    this.STRAFE_DOWN=81;
    this.CENTER=67;

    // arrow keys rotate scene around axis
    // w/s zoom in and out
    // space resets

	// parameters that you can change after initialisation
	this.target	= new THREE.Vector3(0, 0, 0);
	this.speedX	= 0.03;
	this.speedY	= 0.03;
	this.rangeX	= 40;
	this.rangeY	= 40;
    this.minY = 0
    this.rotSpeed = .015;
    this.posSpeed = .1;

    this.rotx = 0;
    this.roty = 0;
    this.posInOut = 0;
    this.posLeftRight = 0;
    this.posUpDown = 0;

    this.handlers = {}

	// private variables
	this._mouseX	= 0;
	this._mouseY	= 0;

	var _this	= this;
	this._$onMouseMove	= function(){ _this._onMouseMove.apply(_this, arguments); };
	this._$onTouchStart	= function(){ _this._onTouchStart.apply(_this, arguments); };
	this._$onTouchMove	= function(){ _this._onTouchMove.apply(_this, arguments); };
	this._$onKeyDown	= function(){ _this._keyDown.apply(_this, arguments); };
	this._$onKeyUp	    = function(){ _this._keyUp.apply(_this, arguments); };

	this._domElement.addEventListener( 'mousemove', this._$onMouseMove, false );
	this._domElement.addEventListener( 'touchstart', this._$onTouchStart,false );
	this._domElement.addEventListener( 'touchmove', this._$onTouchMove, false );
    $(this._domElement).keydown( this._$onKeyDown);
    $(this._domElement).keyup( this._$onKeyUp);
}


THREE.RotateControls.prototype._keyDown = function (event) {
    if (event.keyCode in this.handlers) {
        this.handlers[event.keyCode]();
    }

    if (event.keyCode == this.RIGHT_ARROW) {
        this.roty = this.rotSpeed;
    }
    if (event.keyCode == this.LEFT_ARROW) {
        this.roty = -this.rotSpeed;
    }

    if (event.keyCode == this.UP_ARROW ) {
        this.rotx = this.rotSpeed;
    }
    if (event.keyCode == this.DOWN_ARROW) {
        this.rotx = -this.rotSpeed;
    }

    if (event.keyCode == this.MOVE_FORWARD_KEY) {
        this.posInOut = this.posSpeed;
    }
    if (event.keyCode == this.MOVE_BACK_KEY) {
        this.posInOut = -this.posSpeed;
    }
    if (event.keyCode == this.STRAFE_LEFT) {
        this.posLeftRight = this.posSpeed;
    }
    if (event.keyCode == this.STRAFE_RIGHT) {
        this.posLeftRight = -this.posSpeed;
    }

    if (event.keyCode == this.STRAFE_UP) {
        this.posUpDown = this.posSpeed;
    }
    if (event.keyCode == this.STRAFE_DOWN) {
        this.posUpDown = -this.posSpeed;
    }

    if (event.keyCode == this.CENTER) {
        new TWEEN.Tween(this.scene.rotation).to({x:0, y:0, z:0}, 1000)
             .easing( TWEEN.Easing.Quadratic.EaseOut).start();
        new TWEEN.Tween(this.scene.position).to({x:0, y:0, z:0}, 1000)
             .easing( TWEEN.Easing.Quadratic.EaseOut).start();
        this.lookAt(this.resetCameraTarget);
    }
}


THREE.RotateControls.prototype.lookAt = function(pos) {
    new TWEEN.Tween(this.cameraTarget).to(pos, 1000)
             .easing( TWEEN.Easing.Quadratic.EaseOut).start();
}

THREE.RotateControls.prototype.addKeyPressedHandler = function(key, func) {
    var code = key.toUpperCase().charCodeAt(0);
    this.handlers[code] = func;
}


THREE.RotateControls.prototype._keyUp = function (event) {
    if (event.keyCode == this.RIGHT_ARROW) {
        this.roty = 0;
    }
    if (event.keyCode == this.LEFT_ARROW) {
        this.roty = 0;
    }

    if (event.keyCode == this.UP_ARROW ) {
        this.rotx = 0;
    }
    if (event.keyCode == this.DOWN_ARROW) {
        this.rotx = 0;
    }
    if (event.keyCode == this.MOVE_FORWARD_KEY) {
        this.posInOut = 0;
    }
    if (event.keyCode == this.MOVE_BACK_KEY) {
        this.posInOut = 0;
    }
    if (event.keyCode == this.STRAFE_LEFT) {
        this.posLeftRight = 0;
    }
    if (event.keyCode == this.STRAFE_RIGHT) {
        this.posLeftRight = 0;
    }
    if (event.keyCode == this.STRAFE_UP) {
        this.posUpDown = 0;
    }
    if (event.keyCode == this.STRAFE_DOWN) {
        this.posUpDown = 0;
    }
}


THREE.RotateControls.prototype.destroy	= function()
{
	this._domElement.removeEventListener( 'mousemove', this._$onMouseMove, false );
}

THREE.RotateControls.prototype.update	= function(event)
{
	//this.camera.position.x += ( this._mouseX * this.rangeX - this.camera.position.x ) * this.speedX;
	//this.camera.position.y += ( (this._mouseY + .2) * this.rangeY - this.camera.position.y ) * this.speedY;
	//this.camera.lookAt( this.target );
    this.scene.rotation.x += this.rotx;
    this.scene.rotation.y += this.roty;

    while (this.scene.rotation.x >  2 * Math.PI) {
        this.scene.rotation.x -= 2 * Math.PI;
    }
    
    while (this.scene.rotation.x <  -2 * Math.PI) {
        this.scene.rotation.x += 2 * Math.PI;
    }

    while (this.scene.rotation.y >  2 * Math.PI) {
        this.scene.rotation.y -= 2 * Math.PI;
    }
    
    while (this.scene.rotation.y <  -2 * Math.PI) {
        this.scene.rotation.y += 2 * Math.PI;
    }

    this.scene.position.x += this.posLeftRight;
    this.scene.position.z += this.posInOut;
    this.scene.position.y += this.posUpDown;
    this.camera.lookAt(this.cameraTarget);
}

THREE.RotateControls.prototype._onMouseMove	= function(event)
{
	this._mouseX	= ( event.clientX / window.innerWidth ) - 0.5;
	this._mouseY	= ( event.clientY / window.innerHeight) - 0.5;
}

