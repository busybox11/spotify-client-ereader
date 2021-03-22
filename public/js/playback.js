var playbackprotocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
var playbackaddr = playbackprotocol + window.location.host + window.location.pathname + 'playback';
var playbackws = new WebSocket(playbackaddr);
var app = document.getElementById("app");

function togglePlayback() {
    playbackws.send('togglePlayback');
}

playbackws.onmessage = function(msg) {
    data = JSON.parse(msg.data);
    
    if (data.type == "playingState") {
        player = data.player
        console.log(player)
        document.getElementById("playing-title").innerHTML = player.item.name
        document.getElementById("playing-artist").innerHTML = "- " + player.item.artists[0].name
        document.getElementById("playing-device-name").innerHTML = player.device.name
        if (player.is_playing) {
            document.getElementById("playing-playpause").classList = "mdi mdi-pause"
        } else {
            document.getElementById("playing-playpause").classList = "mdi mdi-play"
        }

        var navHeight = window.getComputedStyle(document.getElementsByTagName('nav')[0]).height
        var playingHeight = window.getComputedStyle(document.getElementById('playing')).height
        app.style.height = "calc(100% - " + navHeight + " - " + playingHeight + " - 1.5rem)"
    }
};

playbackws.onopen = function() {
	playbackws.send('playingState');
}