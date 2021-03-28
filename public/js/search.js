var appRes = document.getElementById("search-results");
var searchbox = document.getElementById("searchbox");

searchbox.onkeydown = function(event) {
	if(event.keyCode == 13) {
        appRes.innerHTML = "Searching..."
        searchws.send('global?query=' + searchbox.value)
    }
}

searchws.onmessage = function(msg) {
	data = JSON.parse(msg.data);

	console.log(data)

	appRes.innerHTML = data.html
};