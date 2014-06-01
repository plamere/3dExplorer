

var gridManager = function() {
    var deltas = [ [1, 0, 0], [-1, 0, 0], [0,1,0], [0, -1, 0], [0, 0, 1], [0,0, -1]];
    var grid = { };
    var minPos 


    var get = function(x,y,z) {
        return x in grid && y in grid[x] && z in grid[x][y] ? grid[x][y][z] : null;
    }

    var set = function(x, y, z, songTile) {
        if (! (x in grid)) {
            grid[x] = {};
        }
        if (! (y in grid[x])) {
            grid[x][y] = {};
        }
        grid[x][y][z] = songTile;
    }

    var countOpenings = function(x, y, z) {
        return getAllOpenings(x,y,z).length;
    }

    var getAllOpenings = function(x,y,z) {
        var openings = [];

        for (var i = 0; i < deltas.length; i++) {
            var delta = deltas[i];
            if (get(delta[0], delta[1], delta[2]) == null) {
                openings.push( delta );
            }
        }
        return openings;
    }

    var randomOpening =  function(x,y,z) {
        var openings = getAllOpenings(x,y,z);
        if (openings.length > 0) {
            shuffle(openings);
            return openings[0];
        } else {
            return null;
        }
    }

    var isOpenRow = function(x,y,z, dx, dy, dz, count) {
        while (count--) {
            x += dx; y+= dy; z += dz;
            if (get(x,y,z) != null) {
                return false;
            }
        }
        return true;
    }

    var findContinuousLinearOpenings = function(x,y,z, count) {
        var sdeltas = deltas.slice(0);
        shuffle(sdeltas);

        for (var i = 0; i < sdeltas.length; i++) {
            var delta = sdeltas[i];
            if (isOpenRow(x, y, z, delta[0], delta[1], delta[2], count)) {
                return delta;
            }
        }
        return null;
    }

    var reserveContinuousLinearOpenings = function(x,y,z, count) {
        var delta = findContinuousLinearOpenings(x,y,z, count);
        if (delta != null) {
            var pos = [x,y,z];
            for (var i = 0; i < count; i++) {
                pos = add(pos, delta);
                set(pos[0], pos[1], pos[2], true);
            }
        }
        return delta;
    }

    var add = function(grid, delta) {
        return [grid[0] + delta[0], grid[1] + delta[1], grid[2] + delta[2]];
    }
    

    var shuffle = function(o){ //v1.0
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    return {
        set: set,
        get: get,
        add: add,
        countOpenings: countOpenings,
        getAllOpenings : getAllOpenings,
        randomOpening: randomOpening,
        isOpenRow: isOpenRow,
        findContinuousLinearOpenings: findContinuousLinearOpenings,
        reserveContinuousLinearOpenings: reserveContinuousLinearOpenings,
    }
}
