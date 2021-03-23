require('dotenv').config()
let express = require('express')
let app = express()
let path = require('path');
let expressWs = require('express-ws')(app);
let spotify = require('./spotify');
let loginScript = require('./login');
let renderScript = require('./render');
const querystring = require('querystring');

const port = 3000

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
			trackId = data.item.id
			ws.send(JSON.stringify({type: 'playingState', player: data}))
		})
	}

	function formatUri(uri) {
		if (uri.substr(0, uri.indexOf('?')) == "") {
			return [uri];
		} else {
			return [uri.substr(0, uri.indexOf('?')), querystring.parse(uri.substr(uri.indexOf('?') + 1))]
		}
	}

	setInterval(function() {
		spotify.getPlayingState().then(function(data) {
			if (data.item.id != trackId) {
				trackId = data.item.id
				ws.send(JSON.stringify({type: 'playingState', player: data}))
			}
		})
	}, 2000)

	ws.on('message', function(msg) {
		uri = formatUri(msg);
		if (msg == "playingState") {
			playingState()
		} else if (uri[0] == "togglePlayback") {
			spotify.togglePlayback().then(function(state) {
				if (state) {
					playingState()
				} else {
					ws.send(JSON.stringify({type: 'togglePlayback', error: 'Failed to toggle playback (see server logs for further information)'}))
				}
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
		}
	});
});

app.listen(port, () => {
	console.log(`Client listening at http://localhost:${port}`)
})
