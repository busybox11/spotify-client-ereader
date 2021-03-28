function transferPlayback(device_id) {
	playbackws.send('transferPlayback?id=' + device_id)
}

playbackws.onmessage = function(msg) {
	data = JSON.parse(msg.data);

	if (data.type == "transferedPlayback") {
		renderws.send('player/devices');
	}
}