require('dotenv').config()
let express = require('express')
let app = express()
let fs = require('fs');
let path = require('path');
let expressWs = require('express-ws')(app);
let spotify = require('./spotify');
let loginScript = require('./login');

const port = 3000

function formatRenderUri(uri) {
	if (uri.substr(0, uri.indexOf('?')) == "") {
		return [uri];
	} else {
		return [uri.substr(0, uri.indexOf('?')), uri.substr(uri.indexOf('?') + 1)]
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
		ws.send(fs.readFileSync(__dirname + `/views/pages/${formatRenderUri(msg)[0]}.html`, 'utf8'));
	});
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
		}
	});
});

app.listen(port, () => {
	console.log(`Client listening at http://localhost:${port}`)
})
