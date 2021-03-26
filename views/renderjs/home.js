let { spotifyApi } = require('../../spotify')

const recentlyPlayedItem = `<div class="home-recent-card" onclick="{item-function}">
    <img class="recent-img {item-type}-img" src="{item-img}">
    {item-desc}
</div>`

const albumDesc = `<span class="recent-album-name">{album-name}</span><br>
<span class="recent-artist-name">{artist-name}</span>`

function renderRecentlyPlayed() {
    return new Promise((resolve, reject) => {
        spotifyApi.getMyRecentlyPlayedTracks({
            limit : 30
        }).then(function(data) {
            contexts = []
            i = 0
            data.body.items.forEach(async function(item) {
                let htmlTop = ""
                let htmlBottom = ""
                if (!contexts.includes(item.context.uri) && contexts.length < 7) {
                    contexts.push(item.context.uri)
                    uri = item.context.uri.split(":")

                    switch (uri[1]) {
                        case 'playlist':
                            let playlist = await spotifyApi.getPlaylist(uri[2])
                            
                            if (playlist.body.images.length < 3) {
                                img = playlist.body.images[0].url
                            } else {
                                img = playlist.body.images[1].url
                            }

                            addItem(
                                uri[1],
                                `openPlaylist('${playlist.body.id}')`,
                                img,
                                playlist.body.name
                            )
                            break;
                        case 'artist':
                            let artist = await spotifyApi.getArtist(uri[2])
                            addItem(
                                uri[1],
                                `openArtist('${artist.body.id}')`,
                                artist.body.images[artist.body.images.length - 2].url,
                                artist.body.name
                            )

                            break;
                        case 'album':
                            let album = await spotifyApi.getAlbum(uri[2])
                            addItem(
                                uri[1],
                                `openAlbum('${album.body.id}')`,
                                album.body.images[0].url,
                                albumDesc.replace('{album-name}', album.body.name)
                                         .replace('{artist-name}', album.body.label)
                            )
                            break;
                    }

                    function addItem(type, functionOnclick, img, desc) {
                        let itemHtml = recentlyPlayedItem.replace('{item-type}', type)
                                                         .replace('{item-function}', functionOnclick)
                                                         .replace('{item-img}', img)
                                                         .replace('{item-desc}', desc)

                        if (i < 4) {
                            htmlTop += itemHtml
                        } else {
                            htmlBottom += itemHtml
                        }

                        if (contexts.length - 1 == i) {
                            sendHtml(htmlTop, htmlBottom)
                        }
                        i++;
                    }
                }
            });

            function sendHtml(top, bottom) {
                html = `<div class="home-recent-row">${top}</div>`
                if (bottom != "") {
                    html += `<div class="home-recent-row">${bottom}</div>`
                }

                return resolve(html);
            }
        }, function(err) {
            return reject('Something went wrong!', err);
        });
    });
}

module.exports = {
    renderRecentlyPlayed
}