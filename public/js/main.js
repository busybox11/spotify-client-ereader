function fetchPage(page, parameters="") {
    var request = new XMLHttpRequest();	

	request.open('GET', `/pages/${page}.html?${parameters}`);

	request.onload = function() {
		document.getElementById('app').innerHTML = request.response;
	};

	request.send();
}

function goTo(page, title, url) {
	if ("undefined" !== typeof history.pushState) {
		history.pushState({page: page}, title, url);
	} else {
		window.location.assign(url);
	}
	if (url == "/") {
		fetchPage('home')
	}
}

if (window.location.pathname == "/") {
	goTo("test", "Spotify eReader", '/');
}