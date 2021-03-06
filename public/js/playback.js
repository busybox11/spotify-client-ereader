var playbackprotocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var playbackaddr = playbackprotocol + window.location.host + window.location.pathname + 'playback';
var playbackws = new WebSocket(playbackaddr);
var app = document.getElementById("app");

function togglePlayback() {
	playbackws.send('togglePlayback');
}

function nextSong() {
	playbackws.send('next');
}

function previousSong() {
	playbackws.send('previous');
}

function playSong(uri) {
	playbackws.send('playUri?uri=' + uri);
}

function playSongWithContext(context_uri, uri) {
	playbackws.send('playUriWithContext?context_uri=' + context_uri + '&uri=' + uri);
}

function playUri(uri, isRandom) {
	playbackws.send('play?uri=' + uri + '&is_random=' + isRandom);
}

function followPlaylist(id, dom_id) {
	playbackws.send('followPlaylist?id=' + id + '&dom_id=' + dom_id);
}

function unfollowPlaylist(id, dom_id) {
	playbackws.send('unfollowPlaylist?id=' + id + '&dom_id=' + dom_id);
}

function followArtist(id, dom_id) {
	playbackws.send('followArtist?id=' + id + '&dom_id=' + dom_id);
}

function unfollowArtist(id, dom_id) {
	playbackws.send('unfollowArtist?id=' + id + '&dom_id=' + dom_id);
}

playbackws.onmessage = function(msg) {
	data = JSON.parse(msg.data);

	console.log(data.type)

	if (data.type == "playingState") {
		if (Object.keys(data.player).length === 0) {
			data.player = {
				device: {
					name: "No device"
				},
				item: {
					artists: [{
						name: ""
					}],
					name: "No music currently playing"
				},
				is_playing: false
			}
		}
		player = data.player
		document.getElementById("playing-title").innerHTML = player.item.name
		document.getElementById("playing-artist").innerHTML = ((player.item.artists[0].name === "") ? "" : "- ") + player.item.artists[0].name // Do not show '-' when no music playing
		document.getElementById("playing-device-name").innerHTML = player.device.name
		var pp = document.getElementById("playing-playpause").classList
		if (player.is_playing) {
			pp.add('mdi-pause');
			pp.remove('mdi-play');
		} else {
			pp.add('mdi-play');
			pp.remove('mdi-pause');
		}

		app.style.marginTop = window.getComputedStyle(document.getElementsByTagName('nav')[0]).height
		app.style.marginBottom = window.getComputedStyle(document.getElementById('playing')).height
	} else if (data.type == "followedPlaylist") {
		document.querySelector(data.dom_id).classList.add('playlist-followed-btn');
		document.querySelector(data.dom_id).innerHTML = "Following";
		document.querySelector(data.dom_id).setAttribute('onclick', "unfollowPlaylist('" + data.id + "', '" + data.dom_id + "')")
	} else if (data.type == "unfollowedPlaylist") {
		document.querySelector(data.dom_id).classList.remove('playlist-followed-btn');
		document.querySelector(data.dom_id).innerHTML = "Follow";
		document.querySelector(data.dom_id).setAttribute('onclick', "followPlaylist('" + data.id + "', '" + data.dom_id + "')")
	} else if (data.type == "followedArtist") {
		document.querySelector(data.dom_id).classList.add('artist-followed-btn');
		document.querySelector(data.dom_id).innerHTML = "Following";
		document.querySelector(data.dom_id).setAttribute('onclick', "unfollowArtist('" + data.id + "', '" + data.dom_id + "')")
	} else if (data.type == "unfollowedArtist") {
		document.querySelector(data.dom_id).classList.remove('artist-followed-btn');
		document.querySelector(data.dom_id).innerHTML = "Follow";
		document.querySelector(data.dom_id).setAttribute('onclick', "followArtist('" + data.id + "', '" + data.dom_id + "')")
	} else if (data.type == "transferredPlayback") {
        document.getElementById("playing-device-name").innerHTML = data.device.name
        if (getActivePage() == "playback_speaker") {
            renderws.send('player/devices');
        }
    }
};

playbackws.onopen = function() {
	playbackws.send('playingState');
}

playbackws.onerror = function(event) {
	app.innerHTML = "<code>playbackws</code> WebSocket reported an error<br>Please refresh the page" + refreshbtnhtml;
	console.error(event)
}

playbackws.onclose = function(event) {
	app.innerHTML = "<code>playbackws</code> WebSocket disconnected<br>Please refresh the page" + refreshbtnhtml;
	console.error(event)
}