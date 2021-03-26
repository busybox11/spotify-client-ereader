require('dotenv').config()
let { spotifyApi } = require('./spotify');
let fs = require('fs');
const querystring = require('querystring');

const playlistSongItem = `<div class="playlist-song" onclick="playSongWithContext('{context_uri}', '{song_uri}')">
	<img class="playlist-song-img" src="{song_img}">
	<div class="playlist-song-info">
		<span class="playlist-song-name">{song_name}</span><br>
		<span class="playlist-song-artist">{song_artist}</span>
	</div>
</div>`

const albumSongItem = `<div class="album-song" onclick="playSongWithContext('{context_uri}', '{song_uri}')">
	<img class="album-song-img" src="{song_img}">
	<div class="album-song-info">
		<span class="album-song-name">{song_name}</span><br>
		<span class="album-song-artist">{song_artist}</span>
	</div>
</div>`

const artistSongItem = `<div class="artist-song" onclick="playSong('{song_uri}')">
	<img class="artist-song-img" src="{song_img}">
	<div class="artist-song-info">
		<span class="artist-song-name">{song_name}</span><br>
		<span class="artist-song-album">{song_album}</span>
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
				console.log(data.body)
				pageHtml = pageHtml.replace('{playlist_name}', data.body.name)
								   .replace('{playlist_description}', data.body.description)
								   .replace('{playlist_img}', data.body.images[0].url)
								   .replace('{playlist_uri}', data.body.uri)

				songsList = '';

				for (value of Object.entries(data.body.tracks.items)) {
					let tmp = playlistSongItem.replace('{song_name}', value[1].track.name)
											  .replace('{song_artist}', value[1].track.artists[0].name)
											  .replace('{song_img}', value[1].track.album.images[2].url)
											  .replace('{song_uri}', value[1].track.uri)
											  .replace('{context_uri}', data.body.uri)

					songsList += tmp;
				}

				pageHtml = pageHtml.replace('{songs_list}', songsList)

				spotifyApi.areFollowingPlaylist(process.env.SPOTIFY_USERNAME, uri[1]['uri'], [process.env.SPOTIFY_USERNAME])
				.then(function(isFollowing) {
					if (isFollowing.body[0]) {
						pageHtml = pageHtml.replace('{playlist-follow-btn-class}', ' playlist-followed-btn')
										   .replace('{playlist-follow-btn-function}', `onclick="unfollowPlaylist('${uri[1]['uri']}', '.playlist-follow-btn')"`)
										   .replace('{playlist-follow-btn-text}', 'Following')
					} else {
						pageHtml = pageHtml.replace('{playlist-follow-btn-class}', '')
										   .replace('{playlist-follow-btn-function}', `onclick="followPlaylist('${uri[1]['uri']}', '.playlist-follow-btn')"`)
										   .replace('{playlist-follow-btn-text}', 'Follow')
					}
					return resolve(pageHtml);
				}, function(err) {
					return reject('Something went wrong!', err);
				});
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		} else if (uri[0] == "album") {
			spotifyApi.getAlbum(uri[1]['uri'])
			.then(function(data) {
				pageHtml = pageHtml.replace('{album_name}', data.body.name)
								   .replace('{album_artist}', data.body.artists[0].name)
								   .replace('{album_img}', data.body.images[0].url)
								   .replace('{album_uri}', data.body.uri)

				songsList = '';

				let i = 0;
				for (value of Object.entries(data.body.tracks.items)) {
					let tmp = albumSongItem.replace('{song_name}', value[1].name)
										   .replace('{song_artist}', value[1].artists[0].name)
										   .replace('{song_img}', data.body.images[2].url)
										   .replace('{song_uri}', value[1].uri)
										   .replace('{context_uri}', data.body.uri)

					songsList += tmp;
					i++;
				}

				pageHtml = pageHtml.replace('{songs_list}', songsList)

				return resolve(pageHtml);
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		} else if (uri[0] == "artist") {
			spotifyApi.getArtist(uri[1]['uri'])
			.then(function(artist) {
				pageHtml = pageHtml.replace('{artist_name}', artist.body.name)
								   .replace('{artist_description}', `${artist.body.followers.total} followers`)
								   .replace('{artist_img}', artist.body.images[0].url)
								   .replace('{artist_uri}', artist.body.uri)

				spotifyApi.getArtistTopTracks(uri[1]['uri'], 'FR')
				.then(function(tracks) {
					songsList = '';

					for (i = 0; i < 5; i++) { // TODO: Handle artists with less than n songs
						track = tracks.body.tracks[i]
						let tmp = artistSongItem.replace('{song_name}', track.name)
												.replace('{song_album}', track.album.name)
												.replace('{song_img}', track.album.images[2].url)
												.replace('{song_uri}', track.uri)

						songsList += tmp
					}

					pageHtml = pageHtml.replace('{songs_list}', songsList)
					return resolve(pageHtml);
				}, function(err) {
					return reject('Something went wrong!', err);
				});
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		} else if (uri[0] == "home") {
			let renderjsHome = require('./views/renderjs/home')

			renderjsHome.renderRecentlyPlayed().then(function(data) {
				pageHtml = pageHtml.replace('{recently_played_content}', data)
				return resolve(pageHtml);
			})
		} else {
			return resolve(pageHtml);
		}
    });
}

module.exports = {
	render
}