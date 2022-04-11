import axios from "axios";
import debugLib from "debug";
import kcappLib from "kcapp-sio-client/kcapp.js";
import dotenv from "dotenv";

let VITE_ODDS_API = "";
let VITE_KCAPP_SOCKET = "";
let VITE_KCAPP_SOCKET_PORT = "";

// use MODE variable to define which .env file to load
// MODE=production node kcapp-sio-updater.js <= loads .env.production
// MODE=production node kcapp-sio-updater.js <= loads .env.development

if (process.env.MODE !== undefined) {
  dotenv.config({ path: ".env." + process.env.MODE });
  VITE_KCAPP_SOCKET = process.env.VITE_KCAPP_SOCKET;
  VITE_KCAPP_SOCKET_PORT = process.env.VITE_KCAPP_SOCKET_PORT;
  VITE_ODDS_API = process.env.VITE_ODDS_API;
}

const debug = debugLib("kcapp-sio-updater");

const KCAPP_HOST = VITE_KCAPP_SOCKET || "localhost";
const KCAPP_PORT = VITE_KCAPP_SOCKET_PORT || 3000;
const KCAPP_PROTO = process.env.KCAPP_PROTO || "http";
const ODDS_API = VITE_ODDS_API || "http://localhost:9999";

const kcapp = kcappLib(KCAPP_HOST, KCAPP_PORT, "kcapp-announcer", KCAPP_PROTO);

kcapp.connect(() => {
  kcapp.on("warmup_started", (data) => {
    const match = data.match;
    debug(`warmup_started for match ${match.id}`);
    axios.post(`${ODDS_API}/games/${match.id}/start`).then((response) => {
      debug(`Updated Odds-API with match started`);
      console.info(`Updated Odds-API with match started`);
    });
  });

  kcapp.on("leg_finished", (data) => {
    const match = data.match;
    if (match.is_finished && match.tournament_id !== null) {
      debug(`Match finished ${match.id}`);

      const body = {
        match_id: match.id,
        winner_id: match.winner_id ? match.winner_id : 0, // 0 if draw
        // Can also add homeWins and awayWins if we need it
      };
      axios
        .post(`${ODDS_API}/games/${match.id}/finish`, body)
        .then((response) => {
          debug(`Updated Odds-API with match finish`);
        })
        .catch((error) => {
          debug(error);
        });
    }
  });
});
