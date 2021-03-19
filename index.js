let express = require('express')
let app = express()
const port = 3000
let path = require('path');

app.use('/', express.static(__dirname + '/public'));
app.use('/pages', express.static(__dirname + '/views/pages'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/views/index.html'));
})

app.listen(port, () => {
	console.log(`Client listening at http://localhost:${port}`)
})

