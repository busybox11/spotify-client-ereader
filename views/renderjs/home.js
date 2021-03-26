let { spotifyApi } = require('../../spotify')

function renderRecentlyPlayed() {
    return new Promise((resolve, reject) => {
        spotifyApi.getMyRecentlyPlayedTracks({
            limit : 20
        }).then(function(data) {
            html = ""
            contexts = []
            data.body.items.forEach(function(item) {
                if (!contexts.includes(item.context.uri) && contexts.length < 7) {
                    contexts.push(item.context.uri)
                }
            });
            console.log(contexts)
            return resolve(data);
        }, function(err) {
            return reject('Something went wrong!', err);
        });
    });
}

module.exports = {
    renderRecentlyPlayed
}