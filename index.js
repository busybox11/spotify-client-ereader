let express = require('express')
let app = express()
let fs = require('fs');
let path = require('path');
let expressWs = require('express-ws')(app);

const port = 3000

app.use('/', express.static(__dirname + '/public'));

app.use('/pages', express.static(__dirname + '/views/pages'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/index.html'));
})

app.ws('/api/render', function(ws, req) {
	ws.on('message', function(msg) {
		console.log(msg)
		ws.send(fs.readFileSync(__dirname + `/views/pages/${msg}.html`, 'utf8'));
	});
});

app.listen(port, () => {
	console.log(`Client listening at http://localhost:${port}`)
})