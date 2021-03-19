var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var address = protocol + window.location.host + window.location.pathname + 'api/render';
var renderws = new WebSocket(address);

(function() {
	renderws.onmessage = function(msg) {
		document.getElementById("app").innerHTML = msg.data
	};
})();

renderws.onopen = function() {
	renderws.send('home');
}