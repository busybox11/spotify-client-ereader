var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var address = protocol + window.location.host + window.location.pathname + 'api/render';
var renderws = new WebSocket(address);
var app = document.getElementById("app");

function openPlaylist(id) {
	renderws.send('playlist?uri=' + id);
}

function getActivePage() {
	var activeAppView = app.firstElementChild.id;
	return activeAppView.substr(activeAppView.indexOf('-') + 1)
}

function viewHome() {
	renderws.send('home');
}

renderws.onmessage = function(msg) {
	try { app.getElementById(getActivePage() + '-script').remove() } catch(e) { console.log('Script tag non-existent') }
	
	app.innerHTML = msg.data;
	var appViewScript = document.createElement("script");
	appViewScript.src = 'js/' + getActivePage() + '.js';
	appViewScript.id = getActivePage() + '-script'
	app.appendChild(appViewScript);
};

renderws.onopen = function() {
	viewHome();
}