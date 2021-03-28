function transferPlayback(device_id) {
	playbackws.send('transferPlayback?id=' + device_id)
}

function decreaseVolume() {
	playbackws.send('decreaseVolume')
}

function increaseVolume() {
	playbackws.send('increaseVolume')
}