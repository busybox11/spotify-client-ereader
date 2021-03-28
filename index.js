require('dotenv').config()
let express = require('express')
let app = express()
let path = require('path');
let expressWs = require('express-ws')(app);
let spotify = require('./spotify');
let loginScript = require('./login');
let renderScript = require('./render');
let renderSearch = require('./views/renderjs/search');
const querystring = require('querystring');

const port = 3000

function formatUri(uri) {
	if (uri.substr(0, uri.indexOf('?')) == "") {
		return [uri];
	} else {
		return [uri.substr(0, uri.indexOf('?')), querystring.parse(uri.substr(uri.indexOf('?') + 1))]
	}
}

app.use('/', express.static(__dirname + '/public'));

app.use('/pages', express.static(__dirname + '/views/pages'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/index.html'));
})

app.get('/login', (req, res) => {
	res.redirect(loginScript.getSpotifyLoginURL());
})

app.get('/callback', (req, res) => {
	spotify.callback(req.query.code);
})

app.ws('/api/render', function(ws, req) {
	ws.on('message', function(msg) {
		renderScript.render(msg).then(function(page) {
			ws.send(page);
		})
	})
});

app.ws('/ping', function(ws, req) {
	ws.on('message', function(msg) {
		console.log('Pong');
	});
});

app.ws('/playback', function(ws, req) {
	let trackId = ""

	function playingState() {
		spotify.getPlayingState().then(function(data) {
			if (data.item !== null) {
				trackId = (Object.keys(data).length === 0) ? "" : data.item.id;
				ws.send(JSON.stringify({type: 'playingState', player: data}))
			}
		})
	}

	function getVolume() {
		return new Promise((resolve, reject) => {
			spotify.getPlayingState().then(function(data) {
				return resolve(data.device.volume_percent)
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		})
	}

	setInterval(function() {
		spotify.getPlayingState().then(function(data) {
			if (data.item !== null) {
				if ((Object.keys(data).length === 0) ? "" : data.item.id != trackId) {
					trackId = data.item.id
					ws.send(JSON.stringify({type: 'playingState', player: data}))
				}
			} else {
				playingState()
			}
		})
	}, 2000)

	ws.on('message', function(msg) {
		uri = formatUri(msg);
		if (msg == "playingState") {
			playingState()
		} else if (uri[0] == "togglePlayback") {
			spotify.togglePlayback().then(function() {
				playingState()
			}, function(err) {
				ws.send(JSON.stringify({type: 'togglePlayback', error: 'Failed to toggle playback (see server logs for further information)'}))
			})
		} else if (uri[0] == "next") {
			spotify.spotifyApi.skipToNext()
			.then(function() {
				playingState()
			}, function(err) {
				ws.send(JSON.stringify({type: 'togglePlayback', error: 'Failed to skip to next song (see server logs for further information)'}))
			});
		} else if (uri[0] == "previous") {
			spotify.spotifyApi.skipToPrevious()
			.then(function() {
				playingState()
			}, function(err) {
				ws.send(JSON.stringify({type: 'togglePlayback', error: 'Failed to skip to previous song (see server logs for further information)'}))
			});
		} else if (uri[0] == "playUri") {
			spotify.spotifyApi.play({"uris": [uri[1]['uri']]})
			.then(function() {
				playingState()
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "playUriWithContext") {
			spotify.spotifyApi.play(
			{
			  "context_uri": uri[1]['context_uri'],
			  "offset": {
			    "uri": uri[1]['uri']
			  },
			  "position_ms": 0
			})
			.then(function() {
				playingState()
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "play") {
			if (uri[1]['is_random'] == "true") {
				spotify.spotifyApi.setShuffle(true)
				.then(function() {}, function (err) {
					console.log('Something went wrong!', err);
				});
			}
			spotify.spotifyApi.play({"context_uri": uri[1]['uri']})
			.then(function() {
				playingState()
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "followPlaylist") {
			spotify.spotifyApi.followPlaylist(uri[1]['id'],
			{
			  'public' : true
			}).then(function(data) {
				ws.send(JSON.stringify({type: 'followedPlaylist', id: uri[1]['id'], dom_id: uri[1]['dom_id']}))
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "unfollowPlaylist") {
			spotify.spotifyApi.unfollowPlaylist(uri[1]['id'])
			.then(function(data) {
				ws.send(JSON.stringify({type: 'unfollowedPlaylist', id: uri[1]['id'], dom_id: uri[1]['dom_id']}))
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "followArtist") {
			spotify.spotifyApi.followArtists([uri[1]['id']])
			.then(function(data) {
				ws.send(JSON.stringify({type: 'followedArtist', id: uri[1]['id'], dom_id: uri[1]['dom_id']}))
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "unfollowArtist") {
			spotify.spotifyApi.unfollowArtists([uri[1]['id']])
			.then(function(data) {
				ws.send(JSON.stringify({type: 'unfollowedArtist', id: uri[1]['id'], dom_id: uri[1]['dom_id']}))
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "transferPlayback") {
			spotify.spotifyApi.transferMyPlayback([uri[1]['id']])
			.then(function() {
				console.log('Transfering playback to ' + [uri[1]['id']]);
				spotify.getPlayingState().then(function(data) {
					let deviceName
					try {
						deviceName = data.device.name
					} catch(e) { deviceName = uri[1]['id'] }
					ws.send(JSON.stringify({type: 'transferredPlayback', device: {id: uri[1]['id'], name: deviceName}}))
				}, function(err) {
					console.log('Something went wrong!', err);
				});
				playingState()
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		} else if (uri[0] == "increaseVolume") {
			getVolume().then(function(volume) {
				spotify.spotifyApi.setVolume(volume + 5)
				.then(function () {
					console.log(`Setting volume to ${volume + 5}`);
				}, function(err) {
					console.log('Something went wrong!', err);
				});
			})
		} else if (uri[0] == "decreaseVolume") {
			getVolume().then(function(volume) {
				spotify.spotifyApi.setVolume(volume - 5)
				.then(function () {
					console.log(`Setting volume to ${volume - 5}`);
				}, function(err) {
					console.log('Something went wrong!', err);
				});
			})
		}
	});
});

app.ws('/search', function(ws, req) {
	ws.on('message', function(msg) {
		uri = formatUri(msg);
		if (uri[0] == "global") {
			renderSearch.globalSearch(uri[1]['query']).then(function(result) {
				ws.send(JSON.stringify({type: 'globalSearch', html: result}))
			})
		}
	})
})

app.listen(port, () => {
	console.log(`Client listening at http://localhost:${port}`)
})

process.on('unhandledRejection', up => { throw up });