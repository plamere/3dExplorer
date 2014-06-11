

var api_key = 'zzwmq54mu8h0xuzwm';

var saveJustinScene = {
    specials: { 'Justin Bieber': 1, 'Selena Gomez & The Scene' : 1, 'Selena Gomez' : 1, 'Nile' :1 },
    bannedSongs: [ 'SOLYGVO12DAA472648'],
    scenes: [
        {   name: 'death metal',
            songs: [],
            seeds: [
                {
                    type:       'artist',
                    seed_type:  'artist',
                    seed:       'nile',
                    max:1,
                },
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'nile',
                    max:0,
                },
            ]
        },
        {   name: 'pop',
            songs: [],
            seeds: [
                {
                    type:       'artist',
                    seed_type:  'artist',
                    seed:       'justin bieber',
                    max:1,
                },
                {
                    type:       'artist',
                    seed_type:  'artist',
                    seed:       'selena gomez and the scene',
                    max:1,
                },
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'justin bieber',
                    max:0,
                },
            ]
        },
        {   name: 'cool jazz',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'miles davis',
                    max:0,
                },
            ]
        },
        {   name: 'country',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'johnny cash',
                    max:0,
                },
            ]
        },
        {   name: 'electronica',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'skrillex',
                    max:0,
                },
            ]
        },
        {   name: 'classic rock',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'jimi hendrix',
                    max:0,
                },
            ]
        },
        {   name: 'alternative',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'radiohead',
                    max:0,
                },
            ]
        },
        {   name: 'classical',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'yo yo ma',
                    max:0,
                },
            ]
        },
        {   name: 'vegas baby',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'frank sinatra',
                    max:0,
                },
            ]
        },
        {   name: 'numetal',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'evanescence',
                    max:0,
                },
            ]
        },
        {   name: 'indie',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'arcade fire',
                    max:0,
                },
            ]
        },
        {   name: 'rap',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'jay-z',
                    max:0,
                },
            ]
        },
        {   name: 'post rock',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'god is an astronaut',
                    max:0,
                },
            ]
        },
        {   name: 'prog rock',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'yes',
                    max:0,
                },
            ]
        },
        {   name: 'grunge',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'nirvana',
                    max:0,
                },
            ]
        },
        {   name: 'soul',
            songs: [],
            seeds: [
                {
                    type:       'artist-radio',
                    seed_type:  'artist',
                    seed:       'james brown',
                    max:0,
                },
            ]
        },
    ],
}



function processScene(theScene, positions) {
    assert(theScene.scenes.length === positions.length);
    shuffle(positions);

    for (var i = 0; i < theScene.scenes.length; i++) {
        var scene = theScene.scenes[i];
        loadScene(theScene, scene, positions[i]);
    }
}


function fetchSeed(which, scene, needed, done) {
    var seed = scene.seeds[which];
    var length = seed.max === 0 ? Math.round(needed * 1.5) : seed.max;
    length = Math.max(5, length);
    length = Math.min(50, length);
    var url = 'http://' + theHost + '/api/v4/playlist/static?api_key=' + api_key.toUpperCase() + '&callback=?';
    $.getJSON(url, { 'artist': seed.seed, 'format':'jsonp', 
                'results': length, 'type':seed.type,
                'bucket': ['tracks', 'id:spotify'], 'limit': true}, function(data) {
            if (checkResponse(data)) {
                populateWithSpotifyData(data.response.songs, done);
            }
    });
}


function populateWithSpotifyData(songs, done) {
    var tids = [];

    songs.forEach(function(song) {
        var fields = song.tracks[0].foreign_id.split(':');
        var sid = fields[fields.length -1];
        tids.push(sid);
    });

    $.getJSON("https://api.spotify.com/v1/tracks/", { 'ids': tids.join(',')}) 
        .done(function(data) {
            data.tracks.forEach(function(track, i) {
                songs[i].spotifyTrackInfo = track;
            });
            done(songs);
        })
        .error( function() {
            info("Whoops, had some trouble getting that playlist");
        }) ;
}

function loadScene(theScene, scene, positions) {

    function goodSong(song) {
        // var ok = (song.tracks && song.tracks.length > 0 && !(song.id in curSongs)) ;
        var ok = (song.tracks && song.tracks.length > 0 
                && song.spotifyTrackInfo.preview_url 
                && song.spotifyTrackInfo.album.images.length > 0 
                && !(song.id in curSongs)) ;
        var bannedArtist = scene.seeds[curSeed].type === 'artist-radio' 
            ?  song.artist_name in theScene.specials : false;
        var bannedSong = (song.id in theScene.bannedSongs);
        return (ok && !bannedArtist && !bannedSong);
    }


    function showSummary() {
        console.log(' == ', scene.name, ' == ' );
        console.log('found', scene.songs.length, 'needed', positions.length);
        for (var i = 0; i < scene.songs.length; i++) {
            console.log(i, scene.songs[i].artist_name);
        }
    }

    function done(songs) {
        var max = scene.seeds[curSeed].max;
        var added = 0;
        for (var i = 0; i < songs.length; i++) {
            var song = songs[i];
            if (goodSong(song)) {
                scene.songs.push(song);
                added++;
                if (max > 0 &&  added >= max) {
                    break;
                }
            }
        }
        if (curSeed < scene.seeds.length - 1) {
            curSeed++;
            fetchSeed(curSeed, scene, positions.length, done);
        } else {
            for (var i = 0; i < scene.songs.length && i < positions.length; i++) {
                var song = scene.songs[i];
                var mpos = positions[i];
                var wpos = maze.mazePosToWorld(mpos);
                var spos = [ wpos.x, wpos.y, wpos.z];
                var height = getRandomHeight();
                var songTile = createMultiLevelSongTile(song, spos, i, height);
                curSongs[song.id] = songTile;
                songGroup.add(songTile);
                maze.pset(mpos, songTile);
                songTile.mazePos = mpos;
            }
            //showSummary();
        }
    }

    var curSeed = 0;
    fetchSeed(curSeed, scene, positions.length, done);
}

function assert(condition) {
    if (!condition) {
        throw 'Asset failed';
    }
}

fetchApiKey( function(apiKey, isLoggedIn) {
    if (api_key != null) {
        api_key = apiKey;
    } 
});
