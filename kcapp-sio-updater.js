import axios from "axios";
import debugLib from "debug";
import kcappLib from "kcapp-sio-client/kcapp.js";
import dotenv from "dotenv";

const debug = debugLib("kcapp-sio-updater");

const MODE = process.env.MODE || "development";
dotenv.config({ path: ".env." + MODE });
debug(`Running in ${MODE} mode`);

const VITE_KCAPP_SOCKET = process.env.VITE_KCAPP_SOCKET;
const VITE_KCAPP_SOCKET_PORT = process.env.VITE_KCAPP_SOCKET_PORT;
const VITE_ODDS_API = process.env.VITE_ODDS_API;
debug(`Connecting to ${VITE_KCAPP_SOCKET}`);

const kcapp = kcappLib(
  VITE_KCAPP_SOCKET,
  VITE_KCAPP_SOCKET_PORT,
  "kcapp-announcer",
  "http"
);
kcapp.connect(() => {
  kcapp.on("warmup_started", (data) => {
    const match = data.match;
    debug(`warmup_started for match ${match.id}`);
    axios.post(`${VITE_ODDS_API}/games/${match.id}/start`).then((response) => {
      debug(`Updated Odds-API with match started`);
    });
  });

  kcapp.on("leg_finished", (data) => {
    const match = data.match;
    if (match.is_finished && match.tournament_id !== null) {
      debug(`Match finished ${match.id}`);

      const body = {
        match_id: match.id,
        winner_id: match.winner_id ? match.winner_id : 0,
      };
      axios
        .post(`${VITE_ODDS_API}/games/${match.id}/finish`, body)
        .then((response) => {
          debug(`Updated Odds-API with match finish`);
        })
        .catch((error) => {
          debug(error);
        });
    }
  });
});
