
var theHost = 'developer.echonest.com';
var theHost = 'snap.sandpit.us';

var stats, scene, renderer;
var camera, cameraControl;
var debugDiv = $("#debug");


var clock = new THREE.Clock();
var projector;
var songGroup;
var playlistSize= 8;
var weezer = 'AR633SY1187B9AC3B9';

var grid = gridManager();

var curSongs = {};


jQuery.ajaxSettings.traditional = true;  


if( !init() )	animate();

// init the scene
function init(){

    if( Detector.webgl ){
        renderer = new THREE.WebGLRenderer({
            antialias		: true,	// to get smoother output
            preserveDrawingBuffer	: true,	// to allow screenshot
            clearColor: 0x000000,

        });
        //renderer.setClearColorHex( 0xBBBBBB, 1 );
        renderer.setClearColorHex( 0x000000, 1 );
    // uncomment if webgl is required
    //}else{
    //	Detector.addGetWebGLMessage();
    //	return true;
    }else{
        renderer	= new THREE.CanvasRenderer();
    }
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);

    // add Stats.js - https://github.com/mrdoob/stats.js
    stats = new Stats();
    stats.domElement.style.position	= 'absolute';
    stats.domElement.style.bottom	= '0px';
    document.body.appendChild( stats.domElement );

    // create a scene
    scene = new THREE.Scene();
    var songGrid = new THREE.Object3D();
    songGroup = new THREE.Object3D();
    songGrid.add(songGroup);

    // put a camera in the scene
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 0, 20);
    scene.add(songGrid);
    scene.add(camera);

    addCameraControl(camera, songGrid);

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);

    // allow 'p' to make screenshot
    // allow 'f' to go fullscreen where this feature is supported
    if( false && THREEx.FullScreen.available() ){
        THREEx.Screenshot.bindKey(renderer);
        THREEx.FullScreen.bindKey();				
    }else{
        document.getElementById('fullscreenDoc').style.display	= "none";				
    }

    projector = new THREE.Projector();

    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    $(renderer.domElement).keydown(onDocumentKeyDown);

    addLights(scene);
    addGrid(songGrid);
    addButtons();
    fetchArtistPlaylist(weezer, [0,0,0]);
}


function addButton(label, func) {
    var button = $("<button>").text(label);
    button.on('click', func);
    $("#buttons").append(button);
}

function addButtons() {
}


function addCameraControl(camera, scene) {
    cameraControls	= new THREE.RotateControls(camera,scene);
    cameraControls.addKeyPressedHandler(' ', function() {
        goMaze(songGroup);
        extendPlaylist();
    });

    cameraControls.addKeyPressedHandler('f', function() {
        goFloor(songGroup);
    });

    cameraControls.addKeyPressedHandler('m', function() {
        goMaze(songGroup);
    });

    cameraControls.addKeyPressedHandler('1', function() {
        goCircle(songGroup);
    });

    cameraControls.addKeyPressedHandler('2', function() {
        goTower(songGroup, Math.floor(songGroup.children.length / 12));
    });
}

var SELECTED = null;

function onDocumentMouseDown( event ) {
    event.preventDefault();
    var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    var mouseY =  - ( event.clientY / window.innerHeight ) * 2 + 1;
    var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
    var intersects = ray.intersectObjects( songGroup.children );

    if ( intersects.length > 0 ) {
        if (SELECTED != null) {
            SELECTED.rotation.y = 0;
            if (SELECTED.stop) {
                SELECTED.stop();
            }
        }
        SELECTED = intersects[ 0 ].object;
        if (SELECTED.play) {
            SELECTED.play();
        }
        SELECTED.tweak();
        var worldPosition = SELECTED.worldPosition(scene);
        console.log('lookat', worldPosition);
        cameraControls.lookAt(worldPosition);
    }
}

function extendPlaylist() {
    if (SELECTED != null) {
        expandSongTile(SELECTED);
    }
}


function expandSongTile(songTile) {
    fetchArtistPlaylist(songTile.artist_id, songTile.pos);
}

function fetchArtistPlaylist(artist_id, pos) {
    var url = 'http://' + theHost + '/api/v4/playlist/basic?api_key=N6E4NIOVYMTHNDM8J&callback=?';
    //var delta = grid.findContinuousLinearOpenings(pos[0], pos[1],pos[2], playlistSize);
    var delta = grid.reserveContinuousLinearOpenings(pos[0], pos[1],pos[2], playlistSize);

    if (delta) {
        $.getJSON(url, { 'artist_id': artist_id, 'format':'jsonp', 
                'results': playlistSize * 2, 'type':'artist-radio',
                'bucket': ['tracks', 'id:7digital-US'], 'limit': true}, function(data) {
            if (checkResponse(data)) {
                var added = 0;
                for (var i in data.response.songs) {
                    var song = data.response.songs[i];
                    if (song.tracks && song.tracks.length > 0 && !(song.id in curSongs)) {
                        pos = grid.add(pos, delta);
                        var songTile = createSongTile(song, pos, i);
                        grid.set(pos[0], pos[1], pos[2], songTile);
                        curSongs[song.id] = songTile;
                        songGroup.add(songTile);
                        if (++added >= playlistSize) {
                            break;
                        }
                    }
                }
                debug("total songs " + songGroup.children.length);
            } else {
                error("Can't find " + artist);
            }
        });
    } else {
        error("No room for that playlist");
    }
}

function checkResponse(data) {
    if (data.response) {
        if (data.response.status.code != 0) {
            error("Whoops... Unexpected error from server. " + data.response.status.message);
            log(JSON.stringify(data.response));
        } else {
            return true;
        }
    } else {
        error("Unexpected response from server");
    }
    return false;
}



function addLights(scene) {
    scene.add( new THREE.AmbientLight( 0x404040 ) );
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.z = 1;
    scene.add( light );

    var light2 = new THREE.DirectionalLight( 0xffffff );
    light2.position.x = 10;
    light2.position.y = 10;
    scene.add( light2 );

    var light3 = new THREE.DirectionalLight( 0xffffff );
    light3.position.x = -10;
    light3.position.y = 10;
    scene.add( light3 );

    // scene.fog = new THREE.FogExp2( 0xffffff, 0.0003 );
    // scene.fog.color.setHSV( 0.1, 0.10, 1 );
    // renderer.setClearColor( scene.fog.color, 1 );
}


function addGrid(scene) {
    var geometry = new THREE.Geometry();
    var spacing = 3;
    var lines = 20;
    var floorPos = -10;
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( - lines * spacing / 2 , floorPos, 0 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(  lines * spacing / 2, floorPos, 0 ) ) );

    var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.7 } );

    for ( var i = 0; i <= lines; i ++ ) {

        var line = new THREE.Line( geometry, material );
        line.position.z = ( i * spacing ) - lines * spacing / 2;
        scene.add( line );

        var line = new THREE.Line( geometry, material );
        line.position.x = ( i * spacing ) - lines * spacing / 2;
        line.rotation.y = 90 * Math.PI / 180;
        scene.add( line );
    }
}

function testMove() {
    for (var i in songGroup.children) {
        var song = songGroup.children[i];
        song.addCmd('position', { x: -10, z: song.position.z, y:song.position.y}, 2000,  song.which * 10);
    }
}

function testMove2() {
    for (var i in songGroup.children) {
        var song = songGroup.children[i];
        song.addCmd('position', { x: 0, z: song.position.z, y:song.position.y}, 2000,  song.which * 10);
    }
}

function debug(s) {
    debugDiv.text(s);
}

function error(s) {
    debugDiv.text(s);
}

function onDocumentKeyDown(event) {
    console.log('odkd', event);
}

// animation loop
function animate() {

    // loop on request animation loop
    requestAnimationFrame( animate );

    // do the render
    render();

    // update stats
    stats.update();
}


function render() {
    // update camera controls
    cameraControls.update(clock.getDelta());
    TWEEN.update( clock.getDelta());
    if (SELECTED != null) {
        SELECTED.rotation.y += .03;
    }
    renderer.render( scene, camera );
}
