var renderprotocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var renderaddress = renderprotocol + window.location.host + window.location.pathname + 'api/render';
var renderws = new WebSocket(renderaddress);
var app = document.getElementById("app");

var refreshbtnhtml = "<div class='error-refresh-div'><span class='error-refresh-btn' onclick='document.location.reload()'><i class='mdi mdi-refresh'></i>Refresh</span></div>"

function openPlaylist(id) {
	renderws.send('playlist?uri=' + id);
}

function openArtist(id) {
	renderws.send('artist?uri=' + id);
}

function openAlbum(id) {
	renderws.send('album?uri=' + id);
}

function getActivePage() {
	var activeAppView = app.firstElementChild.id;
	return activeAppView.substr(activeAppView.indexOf('-') + 1)
}

function viewHome() {
	renderws.send('home');
}

function viewLibrary() {
	renderws.send('library');
}

function viewSearch() {
	renderws.send('search');
}

renderws.onmessage = function(msg) {
	try { app.getElementById(getActivePage() + '-script').remove() } catch(e) { console.log('Script tag non-existent') }
	
	app.innerHTML = msg.data;
	var appViewScript = document.createElement("script");
	appViewScript.src = 'js/' + getActivePage() + '.js';
	appViewScript.id = getActivePage() + '-script'
	app.appendChild(appViewScript);
	app.scrollTop = 0;
};

renderws.onopen = function() {
	viewHome();
}

renderws.onerror = function(event) {
    app.innerHTML = "<code>renderws</code> WebSocket reported an error<br>Please refresh the page<br>" + refreshbtnhtml;
    console.error(event)
}

renderws.onclose = function(event) {
    app.innerHTML = "<code>renderws</code> WebSocket disconnected<br>Please refresh the page<br>" + refreshbtnhtml;
    console.error(event)
}