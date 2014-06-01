// The maze manager


var mazeManager = function(type, r, c) {
    var maze = {}
    var rows;
    var cols;
    var startingPoint;
    var endingPoint;

    function createMaze(type, r, c) {
        rows = r;
        cols = c;

        if (type == 'random') {
            createRandomMaze();
        } else if (type == 'prims') {
            createPrimsMaze();
        } else {
            console.log('unknown maze type');
        }
    }

    function createRandomMaze() {
        // 30% of area is wall
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                set(i, j, Math.random() >= .3);
            }
        }

        startingPoint = pickRandomVisitablePoint();
        endingPoint = pickRandomVisitablePoint();
    }

    function createPrimsMaze() {
        var walls = [];

        function append(l) {
            for (var i in l) {
                if (pget(l[i]) == false) {
                    walls.push(l[i]);
                }
            }
            shuffle(walls);
        }

        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                set(i, j, false);
            }
        }
        startingPoint = pickRandomPoint();
        pset(startingPoint, true);
        append(getNeighbors(startingPoint));

        while (walls.length > 0) {
            var point = walls.pop();
            if (pget(point) == true) {
                // i'm not a wall anymore so skip it
                continue;
            }

            var count = getUnreachableNeighborCount(point);
            if (count > 0) {
                pset(point, true);
                endingPoint = point;        // last one assigned is the end
                append(getNeighbors(point));
            }

            /*
            var neighbor = getUnreachableNeighbor(point);
            if (neighbor !== null) {
                pset(point, true);
                endingPoint = point;        // last one assigned is the end
                append(getNeighbors(point));
            }
            */
        }
    }

    function pickRandomPoint() {
        return [ Math.floor(Math.random() * rows), Math.floor(Math.random() * cols) ];
    }

    function pickRandomVisitablePoint() {
        var point;
        do {
            point = pickRandomPoint();
        } while (!isVisitable(point[0], point[1]));
        return point;
    }

    // in the maze: undefined is not in the maze, true is visitable, 
    // false is unassigned wall, song is
    // assigned wall

    function get(r,c)  {
        if (r in maze) {
            return maze[r][c];
        } 
        return undefined;
    }

    function pget(point)  {
        var r = point[0];
        var c = point[1];
        return get(r,c);
    }

    function set(r,c, val) {
        if (r >= 0 && r < rows && c >=0 && c < cols) {
            if (maze[r] === undefined) {
                maze[r] = {};
            }
            maze[r][c] = val;
            return true;
        }
        return false;
    }

    function pset(point, val)  {
        var r = point[0];
        var c = point[1];
        return set(r,c, val);
    }

    function isInMaze(r,c)  {
        return get(r,c) !== undefined;
    }

    function isVisitable(r,c)  {
        return get(r,c) === true;
    }

    function isUnassigned(r,c)  {
        return get(r,c) === false;
    }

    function isAssigned(r,c)  {
        return isInMaze(r,c) && !isUnassigned(r,c);
    }

    function getStartingPoint() {
        return startingPoint;
    }

    function getEndingPoint() {
        return endingPoint;
    }

    function getUnassignedNeighbors(r,c, radius) {
        var results = [];
        for (var i = r - radius; i < r + radius; i++) {
            for (var j = c - radius; j < c + radius; i++) {
                if (isUnAssigned(i, j)) {
                    results.push( [i,j] );
                }
            }
        }
        return results;
    }

    function getNeighbors(p) {
        var r = p[0];
        var c = p[1];
        var results = [];
        if (r < rows - 1) {
            results.push( [r+1, c]);
        }
        if (r > 0) {
            results.push( [r-1, c]);
        }
        if (c > 0) {
            results.push( [r, c - 1]);
        }
        if (c < cols - 1) {
            results.push( [r, c + 1]);
        }
        shuffle(results);
        return results;
    }

    function getUnreachableNeighbor(p) {
        var neighbors = getNeighbors(p);
        for (var i  = 0; i < neighbors.length; i++) {
            if (!isReachable(neighbors[i])) {
                return neighbors[i];
            }
        }
        return null;
    }

    function getUnreachableNeighborCount(p) {
        var count = 0;
        var neighbors = getNeighbors(p);
        for (var i  = 0; i < neighbors.length; i++) {
            if (!isReachable(neighbors[i])) {
                count++;
            }
        }
        return count;
    }

    function isReachable(p) {
        var neighbors = getNeighbors(p);
        for (var i = 0; i <  neighbors.length; i++) {
            if (pget(neighbors[i]) == true) {
                return true;
            }
        }
        return false;
    }

    function getAllUnassigned() {
        var results = [];
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                if (isUnassigned(i, j)) {
                    results.push( [i,j] );
                }
            }
        }
        return results;
    }

    function mazePosToWorld(pos) {
        return {x: pos[0] - rows / 2 + .5, y:.5, z:pos[1] - cols / 2 + .5};
    }

    function worldPosToMaze(pos) {
        return [ pos.x + rows / 2 - .5, pos.z + cols / 2 - .5];
    }

    createMaze(type, r, c);

    return {
        get:get,
        set:set,
        pset:pset,
        pget:pget,
        isInMaze: isInMaze,
        isVisitable: isVisitable,
        isUnAssigned: isUnassigned,
        isAssigned: isAssigned,
        getStartingPoint: getStartingPoint,
        getEndingPoint: getEndingPoint,
        getUnassignedNeighbors: getUnassignedNeighbors,
        getAllUnassigned: getAllUnassigned,
        mazePosToWorld: mazePosToWorld,
        worldPosToMaze: worldPosToMaze,
    };
}



