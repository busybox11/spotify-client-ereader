require('dotenv').config()
let express = require('express')
let app = express()
let path = require('path');
let expressWs = require('express-ws')(app);
let spotify = require('./spotify');
let loginScript = require('./login');
let renderScript = require('./render');

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
	ws.on('message', function(msg) {
		if (msg == "playingState") {
			spotify.getPlayingState().then(function(data) {
				ws.send(JSON.stringify({type: 'playingState', player: data}))
			})
		} else if (msg == "togglePlayback") {
			spotify.togglePlayback().then(function(state) {
				if (state) {
					spotify.getPlayingState().then(function(data) {
						ws.send(JSON.stringify({type: 'playingState', player: data}))
					})
				} else {
					ws.send(JSON.stringify({type: 'togglePlayback', error: 'Failed to toggle playback (see server logs for further information)'}))
				}
			})
		}
	});
});

app.listen(port, () => {
	console.log(`Client listening at http://localhost:${port}`)
})
