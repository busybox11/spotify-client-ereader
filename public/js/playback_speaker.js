function transferPlayback(device_id) {
	playbackws.send('transferPlayback?id=' + device_id)
}

function decreaseVolume() {
	playbackws.send('decreaseVolume')
}

function increaseVolume() {
	playbackws.send('increaseVolume')
}

playbackws.onmessage = function(msg) {
	data = JSON.parse(msg.data);

	if (data.type == "transferedPlayback") {
		renderws.send('player/devices');
	}
}