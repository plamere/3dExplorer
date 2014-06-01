



function goFloor(songGroup) {
    var yfloor = -9.5;
    var dim = Math.round(Math.sqrt(songGroup.children.length));
    console.log('gofloor', dim);
    var spacing = 1.1;
    var offset = dim / 2 * spacing;
    for (var i in songGroup.children) {
        var song = songGroup.children[i];
        var x = i % dim * spacing - offset;
        var z = Math.floor(i / dim) * spacing - offset;
        rotate(song, -Math.PI / 2, 0, 0, song.which);
        move(song, x, yfloor, z, song.which);
    }
}


function goCircle(songGroup) {
    var circumference = songGroup.children.length;
    var radius = circumference / (2 * Math.PI) * 1.4;
    var theta = 0;
    var delta = 2 * Math.PI / circumference;
    for (var i in songGroup.children) {
        var song = songGroup.children[i];
        var x = radius * Math.sin(theta);
        var y = 0;
        var z = radius * Math.cos(theta);
        rotate(song, 0, theta, 0, i);
        move(song, x, y, z, i);
        theta += delta;
        theta = normalizeAngle(theta);
    }
}

function goTower(songGroup, layers) {
    console.log('tower', layers);
    if (layers > 0) {
        var circumference = Math.ceil(songGroup.children.length / layers);
        var radius = circumference / (2 * Math.PI) * 1.4;
        var theta = 0;
        var base = 0;
        var delta = 2 * Math.PI / circumference;
        console.log('tower', layers, circumference, radius);
        for (var i in songGroup.children) {
            var song = songGroup.children[i];
            var x = radius * Math.sin(theta);
            var y = base + Math.floor(i / circumference);
            var z = radius * Math.cos(theta);
            rotate(song, 0, theta, 0, i);
            move(song, x, y, z, i);
            theta += delta;
            theta = normalizeAngle(theta);
        }
    }
}

function normalizeAngle(angle) {
    while (angle > 2 * Math.PI) {
        angle -= Math.PI * 2;
    }
    while (angle < 0) {
        angle += Math.PI * 2;
    }
    return angle;
}

function goMaze(songGroup) {
    for (var i in songGroup.children) {
        var song = songGroup.children[i];
        rotate(song, 0, 0, 0, 0);
        song.addCmd('position', song.destination, 4000, song.which * 100, TWEEN.Easing.Elastic.EaseOut);
    }
}


function move(song, x, y, z, which) {
    song.addCmd('position', {x:x, y:y, z:z }, 2000, which * 10, TWEEN.Easing.Cubic.EaseInOut);
}

function rotate(song, rx, ry, rz, which) {
    song.addCmd('rotation', {x:rx, y:ry, z:rz }, 2000, which * 10, TWEEN.Easing.Cubic.EaseInOut, false);
}
