const Gamedig = require('gamedig');

const APPID_TO_TYPE = {
    '4020': 'garrysmod',
    '232250': 'tf2',
    '740': 'csgo',
    '4940': 'css',
    '222860': 'l4d2',
    '1007': 'hl2dm'
};

class QueryService {
    async query(server) {
        const type = APPID_TO_TYPE[server.appId];
        if (!type) return null;

        let port = 27015;
        // Try to find port in args
        const portIdx = server.args.indexOf('+port');
        if (portIdx !== -1 && server.args[portIdx + 1]) {
            port = parseInt(server.args[portIdx + 1], 10);
        } else {
            const dashPortIdx = server.args.indexOf('-port');
            if (dashPortIdx !== -1 && server.args[dashPortIdx + 1]) {
                port = parseInt(server.args[dashPortIdx + 1], 10);
            }
        }

        try {
            const state = await Gamedig.query({
                type: type,
                host: '127.0.0.1',
                port: port,
                maxAttempts: 1
            });

            return {
                online: true,
                players: state.players.length,
                maxPlayers: state.maxplayers,
                name: state.name,
                map: state.map,
                playerList: state.players.map(p => ({ name: p.name, score: p.score, time: p.time }))
            };
        } catch (e) {
            return { online: false };
        }
    }
}

module.exports = new QueryService();
