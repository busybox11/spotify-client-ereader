let { spotifyApi } = require('../../spotify')

const globalSearchHTML = `<div class="search-section">
	<h2 class="search-section-title">Playlists</h2>
	<div class="search-res-global-result-container">
		<div class="search-res-global-row">{res-global-playlists-row1}</div>
		<div class="search-res-global-row">{res-global-playlists-row2}</div>
	</div>
</div>

<div class="search-section">
	<h2 class="search-section-title">Artists</h2>
	<div class="search-res-global-result-container">
		<div class="search-res-global-row">{res-global-artists-row1}</div>
		<div class="search-res-global-row">{res-global-artists-row2}</div>
	</div>
</div>

<div class="search-section">
	<h2 class="search-section-title">Tracks</h2>
	<div class="search-res-global-result-container">
		<div class="search-res-global-row">{res-global-tracks-row1}</div>
		<div class="search-res-global-row">{res-global-tracks-row2}</div>
	</div>
</div>`

const globalSearchItemHTML = `<div class="search-res-global-item" onclick="{item-function}">
    <img class="search-img {item-type}-img" src="{item-img}">
    {item-desc}
</div>`

const trackOrAlbumDescHTML = `<span class="search-res-item-name">{item-name}</span><br>
<span class="search-res-item-artist">{item-artist}</span>`

function globalSearch(query) {
	return new Promise((resolve, reject) => {
		// PLAYLISTS FETCH
		spotifyApi.searchPlaylists(uri[1]['query'])
		.then(function(playlistsRes) {
			let playlistRow1 = ""
			let playlistRow2 = ""
			let renderHTML = ""
			for (i = 0; i < 6; i++) {
				let item = globalSearchItemHTML
				try {
					let result = playlistsRes.body.playlists.items[i]

					if (i == 0 && result == undefined) {
						playlistRow1 = "No results for this search category"
					}

					item = item.replace('{item-function}', `openPlaylist('${result.id}')`)
							   .replace('{item-type}', 'playlist')
							   .replace('{item-img}', result.images[0].url)
							   .replace('{item-desc}', result.name)

					if (i < 3) {
						playlistRow1 += item
					} else {
						playlistRow2 += item
					}
				} catch(e) {}
			}

			renderHTML = globalSearchHTML.replace('{res-global-playlists-row1}', playlistRow1)
										 .replace('{res-global-playlists-row2}', playlistRow2)

			spotifyApi.searchArtists(uri[1]['query'])
			.then(function(artistsRes) {
				let artistRow1 = ""
				let artistRow2 = ""
				for (i = 0; i < 6; i++) {
					let item = globalSearchItemHTML
					try {
						let result = artistsRes.body.artists.items[i]

						if (i == 0 && result == undefined) {
							artistRow1 = "No results for this search category"
						}

						item = item.replace('{item-function}', `openArtist('${result.id}')`)
								   .replace('{item-type}', 'artist')
								   .replace('{item-img}', result.images[0].url)
								   .replace('{item-desc}', result.name)

						if (i < 3) {
							artistRow1 += item
						} else {
							artistRow2 += item
						}
					} catch(e) {}
				}
				renderHTML = renderHTML.replace('{res-global-artists-row1}', artistRow1)
									   .replace('{res-global-artists-row2}', artistRow2)

				spotifyApi.searchTracks(uri[1]['query'])
				.then(function(tracksRes) {
					let tracksRow1 = ""
					let tracksRow2 = ""
					for (i = 0; i < 6; i++) {
						let item = globalSearchItemHTML
						try {
							let result = tracksRes.body.tracks.items[i]

							if (i == 0 && result == undefined) {
								tracksRow1 = "No results for this search category"
							}

							let trackDesc = trackOrAlbumDescHTML.replace('{item-name}', result.name)
																.replace('{item-artist}', result.artists[0].name)


							item = item.replace('{item-function}', `playSong('${result.uri}')`)
									   .replace('{item-type}', 'track')
									   .replace('{item-img}', result.album.images[0].url)
									   .replace('{item-desc}', trackDesc)

							if (i < 3) {
								tracksRow1 += item
							} else {
								tracksRow2 += item
							}
						} catch(e) {}
					}
					renderHTML = renderHTML.replace('{res-global-tracks-row1}', tracksRow1)
										   .replace('{res-global-tracks-row2}', tracksRow2)

					return resolve(renderHTML)
				}, function(err) {
					console.error(err);
				});
			}, function(err) {
				return reject('Something went wrong!', err);
			});
		}, function(err) {
			return reject('Something went wrong!', err);
		});
	})
}

module.exports = {
	globalSearch
}