let { spotifyApi } = require('./spotify');
let fs = require('fs');
const querystring = require('querystring');

const playlistSongItem = `<div class="playlist-song" onclick="playSong('{song_id}')">
	<img class="playlist-song-img" src="{song_img}">
	<div class="playlist-song-info">
		<span class="playlist-song-name">{song_name}</span><br>
		<span class="playlist-song-artist">{song_artist}</span>
	</div>
</div>`

const albumSongItem = `<div class="album-song" onclick="playSong('{song_id}')">
	<img class="album-song-img" src="{song_img}">
	<div class="album-song-info">
		<span class="album-song-name">{song_name}</span><br>
		<span class="album-song-artist">{song_artist}</span>
	</div>
</div>`

function formatRenderUri(uri) {
	if (uri.substr(0, uri.indexOf('?')) == "") {
		return [uri];
	} else {
		return [uri.substr(0, uri.indexOf('?')), querystring.parse(uri.substr(uri.indexOf('?') + 1))]
	}
}

function render(msg) {
	return new Promise((resolve, reject) => {
        uri = formatRenderUri(msg);
		let pageHtml = fs.readFileSync(__dirname + `/views/pages/${uri[0]}.html`, 'utf8');
		if (uri[0] == "playlist") {
			spotifyApi.getPlaylist(uri[1]['uri'])
			.then(function(data) {
				pageHtml = pageHtml.replace('{playlist_name}', data.body.name)
								   .replace('{playlist_description}', data.body.description)
								   .replace('{playlist_img}', data.body.images[0].url);

				songsList = '';

				for (value of Object.entries(data.body.tracks.items)) {
					let tmp = playlistSongItem.replace('{song_name}', value[1].track.name)
											  .replace('{song_artist}', value[1].track.artists[0].name)
											  .replace('{song_img}', value[1].track.album.images[2].url)
											  .replace('{song_id}', value[1].track.id)

					songsList += tmp
				}

				pageHtml = pageHtml.replace('{songs_list}', songsList)

				return resolve(pageHtml);
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		} else if (uri[0] == "album") {
			spotifyApi.getAlbum(uri[1]['uri'])
			.then(function(data) {
				pageHtml = pageHtml.replace('{album_name}', data.body.name)
								   .replace('{album_artist}', data.body.artists[0].name)
								   .replace('{album_img}', data.body.images[0].url);

				songsList = '';

				for (value of Object.entries(data.body.tracks.items)) {
					console.log(value)
					let tmp = albumSongItem.replace('{song_name}', value[1].name)
										   .replace('{song_artist}', value[1].artists[0].name)
										   .replace('{song_img}', data.body.images[2].url)
										   .replace('{song_id}', value[1].id)

					songsList += tmp
				}

				pageHtml = pageHtml.replace('{songs_list}', songsList)

				return resolve(pageHtml);
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		} else {
			return resolve(pageHtml);
		}
    });
}

module.exports = {
	render
}