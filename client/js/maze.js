
var theHost = 'developer.echonest.com';
var stats, scene, renderer;
var camera, cameraControl;


var clock = new THREE.Clock();
var projector;
var songGroup;
var maxPlaylistSize = 250;


var maze;
var curSongs = {};
var mazeSize = 40;  // should be a power of 4 (sqrt of seeds.length)
var mazeSize = 32;  // should be a power of 4 (sqrt of seeds.length)


jQuery.ajaxSettings.traditional = true;  

$(document).ready(function() {
    console.log('doc ready');
    initAudio();
});


function audioReady() {
    if( !init() )	animate();
}

// init the scene
function init(){

    if( Detector.webgl ){
        renderer = new THREE.WebGLRenderer({
            antialias		: true,	// to get smoother output
        });
    }else{
    	Detector.addGetWebGLMessage();
    	return true;
    }


    maze = mazeManager('prims', mazeSize, mazeSize);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild(renderer.domElement);

    initGritter();

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
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .2, 10000 );
    camera.position.set(.0, .5, 3.0);
    scene.add(songGrid);
    scene.add(camera);

    addCameraControl(camera, songGrid, maze);

    // transparently support window resize
    THREEx.WindowResize.bind(renderer, camera);

    projector = new THREE.Projector();

    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );

    addLights(scene);
    addFloor(saveJustinScene.scenes);
    buildMaze();

    info("Welcome to the 3D Music Maze", "Thanks for stopping by.");
}


function buildMaze() {
    var slices = splitPoints();
    processScene(saveJustinScene, slices);
}

function splitPoints() {
    var sectionsPerSide = Math.round(Math.sqrt(saveJustinScene.scenes.length));
    var sectionSize = mazeSize / sectionsPerSide;
    var points = maze.getAllUnassigned();
    var results = [];

    //console.log(mazeSize, seeds.length, sectionSize, sectionsPerSide);
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var r  = Math.floor(point[0] / sectionSize) * sectionsPerSide;
        var c  = Math.floor(point[1] / sectionSize);
        var index = r + c;
        //console.log(i, point[0], point[1], index);
        if (results[index] === undefined) {
            results[index] = [];
        }
        results[index].push(point);
    }
    shuffle(results);
    return results;
}


function addCameraControl(camera, scene, maze) {
    cameraControls	= new THREE.MazeControls(camera,scene, maze);
    cameraControls.addKeyPressedHandler('H', showHelp);
    //cameraControls.addKeyPressedHandler('1', swapJustinAndNile);
}

function showHelp() {
    sinfo('help', 'Use arrow keys and WASD to look and move around. Space to jump.');
}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
    var mouseY =  - ( event.clientY / window.innerHeight ) * 2 + 1;
    var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
    var intersects = ray.intersectObjects( songGroup.children );

    if ( intersects.length > 0 ) {
        var selected = intersects[ 0 ].object;
        if (selected.play) {
            selected.play();
        }
    }
}


function expandSongTile(songTile) {
    fetchArtistPlaylist(songTile.artist_id, songTile.pos);
}


function fetchSongsByArtist(artist_name, mazePositions) {

    // get a little bit extra because there are still 7D songs
    // without tracks

    var length = mazePositions.length + Math.round(mazePositions.length * .2);
    if (length > maxPlaylistSize) {
        length = maxPlaylistSize;
    }
    var url = 'http://' + theHost + '/api/v4/playlist/basic?api_key=N6E4NIOVYMTHNDM8J&callback=?';
    $.getJSON(url, { 'artist': artist_name, 'format':'jsonp', 
                'results': length, 'type':'artist-radio',
                'bucket': ['tracks', 'id:7digital-US'], 'limit': true}, function(data) {
            if (checkResponse(data)) {
                var added = 0;
                for (var i in data.response.songs) {
                    var song = data.response.songs[i];
                    if (song.tracks && song.tracks.length > 0 && !(song.id in curSongs)) {
                        var mpos = mazePositions[added];
                        var wpos = maze.mazePosToWorld(mpos);
                        var spos = [ wpos.x, wpos.y, wpos.z];
                        var height = getRandomHeight();
                        var songTile = createMultiLevelSongTile(song, spos, i, height);
                        curSongs[song.id] = songTile;
                        songGroup.add(songTile);
                        maze.pset(mpos, songTile);
                        songTile.mazePos = mpos;
                        added++;
                    } else {
                        // songGroup.add(randomCube(wpos));
                    }
                    if (added >= mazePositions.length) {
                        break;
                    }
                }

                //scene.add(songGroup);
            } else {
                error("Can't find " + artist);
            }
            //console.log("fetch", artist_name, mazePositions.length, added);
            // if we couldn't fill all the positions, clear out the xtras
            for (var i = added; i < mazePositions.length; i++) {
                var position = mazePositions[i];
                var wpos = maze.mazePosToWorld(position);
                songGroup.add(randomCube(wpos));
                //maze.set(position[0], position[1], true);
                //console.log('clearing', i);
            }
        });
}



function getRandomHeight() {
    var r = Math.random();
    var height = 1;
    if (r > .9) {
        height += 1;
    }

    if (r > .92) {
        height += 1;
    }

    if (r > .96) {
        height += 3;
    }
    if (r > .99) {
        height += 5;
    }
    return height;
}



function randomPos() {
    var rx = Math.round(Math.random() * 20 - 10);
    var rz = Math.round(Math.random() * 20 - 10);
    return [rx, .5, rz ];
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
    var radius = 20;
    //scene.add( new THREE.AmbientLight( 0x404040 ) );
    scene.add( new THREE.AmbientLight( 0x707070 ) );
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.z = 1;
    scene.add( light );

    var light2 = new THREE.DirectionalLight( 0xffffff );
    light2.position.x = radius;
    light2.position.y = 10;
    light2.position.z = radius;
    scene.add( light2 );

    var light3 = new THREE.DirectionalLight( 0xffffff );
    light3.position.x = -radius;
    light3.position.y = 10;
    light2.position.z = radius;
    scene.add( light3 );

    var light4 = new THREE.DirectionalLight( 0xffffff );
    light4.position.x = 0;
    light4.position.y = 10;
    light2.position.z = -radius;
    scene.add( light4 );

    // scene.fog = new THREE.FogExp2( 0xffffff, 0.0003 );
    // scene.fog.color.setHSV( 0.1, 0.10, 1 );
    // renderer.setClearColor( scene.fog.color, 1 );
}


function addFloor(scenes) {
    var sectionsPerSide = Math.round(Math.sqrt(scenes.length));
    var sectionSize = mazeSize / sectionsPerSide;

    for (var i = 0; i < sectionsPerSide; i++) {
        for (var j = 0; j < sectionsPerSide; j++) {
            addFloorSegment(i, j, sectionSize);
        }
    }
}

function addFloorSegment(sr, sc, sectionSize, extra) {
    var geometry = new THREE.Geometry();
    var spacing = 1;
    var lines = mazeSize;
    var floorPos = 0;
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0, floorPos, 0 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( sectionSize, floorPos, 0 ) ) );

    var material = new THREE.LineBasicMaterial( { color: Math.random() * 0xffffff, opacity: 1.0 } );

    var baseX = sc * sectionSize * spacing;
    var baseZ = sr * sectionSize * spacing;
    for ( var i = 0; i < sectionSize; i ++ ) {
        var line = new THREE.Line( geometry, material );
        line.position.x = baseX  - lines * spacing / 2; 
        line.position.z = baseZ + i * spacing - lines * spacing / 2;
        scene.add( line );

        var line = new THREE.Line( geometry, material );
        line.position.x = baseX + i * spacing - lines * spacing / 2; 
        line.position.z = sectionSize + baseZ - lines * spacing / 2; 
        line.rotation.y = 90 * Math.PI / 180;
        scene.add( line );
    }
}

function initGritter() {
    $.gritter.options.position='top-right';
}
function info(title, msg) {
    $.gritter.add( {'title': title, 'text': msg, sticky:false});
}

function sinfo(title, msg) {
    $.gritter.add( {'title': title, 'text': msg, sticky:true});
}

function error(s) {
    $.gritter.add( {'title': 'Trouble ...', 'text': s, 'time':3000 });
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


function randomCube(pos) {
    var r = Math.random();
    var height = 3;
    if (r < .1) {
        if (r < .02) {
            height = 8;
        }
        var cubeGroup = new THREE.Object3D();
        for (var i = 0; i < height; i++) {
            var cube = randomSingleCube({x:0, y:i, z:0});
            cubeGroup.add(cube);
        }
        cubeGroup.position = pos;
        return cubeGroup;
    } else {
        return randomSingleCube(pos);
    }
}

function swapJustinAndNile() {
    var justin = findSongByArtist('Justin Bieber');
    var nile = findSongByArtist('Nile');

    if (justin != null && nile != null) {
        swapSongs(justin, nile);
    } else {
        info("missing", "no justin or nile");
    }
}

function swapSongs(s1, s2) {
    function fancyMove(s, pos) {
        s.addCmd('position', {y:10}, 3000, 0, TWEEN.Easing.Quadratic.EaseIn);
        s.addCmd('position', {x:pos.x, y:10, z:pos.z}, 1000, 0, TWEEN.Easing.Linear.EaseNone);
        s.addCmd('position', pos, 3000, 0, TWEEN.Easing.Quadratic.EaseOut);
    }

    if (s1 != null && s2 != null) {
        //omg, position is maintained in 3 places!
        // the mesh, the song and the maze
        // all 3 have to be swapped

        // swap the mesh positions by actually moving
        // the meshes
        var s1pos = $.extend({}, s1.position);
        var s2pos = $.extend({}, s2.position);
        fancyMove(s1, s2pos);
        fancyMove(s2, s1pos);

        // reassign the songs in the maze
        var mpos = s1.mazePos;
        s1.mazePos = s2.mazePos;
        s2.mazePos = mpos;
        maze.pset(s1.mazePos, s1);
        maze.pset(s2.mazePos, s2);

        // swap the destination field
        var tdest = s1.destination;
        s1.destination = s2.destination;
        s2.destination = tdest;
    } else {
        info("missing", "no justin or nile");
    }
}

function findSongByArtist(name) {
    for (var i = 0; i < songGroup.children.length; i++) {
        var song = songGroup.children[i];
        if (song.artist === name) {
            return song;
        }
    }
    return null;
}

function randomSingleCube(pos) {
    var materials = [];

    for ( var i = 0; i < 6; i ++ ) {
        materials.push( new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ) );
    }

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1, 1, 1, 1, materials ), 
        new THREE.MeshFaceMaterial() );
    cube.position = pos;
    return cube;
}

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function showNowPlaying(song) {
    $.gritter.add( {'title': song.title, 'text': song.artist, 'time':3000});
}


function render() {
    // update camera controls
    cameraControls.update(clock.getDelta());
    TWEEN.update( clock.getDelta());
    renderer.render( scene, camera );
}
