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
const VITE_KCAPP_API = process.env.VITE_KCAPP_API;
const VITE_ODDS_API = process.env.VITE_ODDS_API;
const VITE_OFFICE_ID = process.env.VITE_OFFICE_ID;
debug(`Connecting to ${VITE_KCAPP_SOCKET}`);

const kcapp = kcappLib(
  VITE_KCAPP_SOCKET,
  VITE_KCAPP_SOCKET_PORT,
  "kcapp-announcer",
  "http"
);

const finishedTournaments = new Set();
debug(`Updating all finished tournaments`);
axios
.get(`${VITE_ODDS_API}/tournament/meta`).then((response) => {
  const tournaments = response.data;
  for (let idx in tournaments) {
    const tournament = tournaments[idx];
    if (tournament.bets_off === 1) {
      finishedTournaments.add(tournament.tournament_id);
    }
  }
})
.catch((error) => {
  debug(error);
});

debug(`Updating all finished matches for office ${VITE_OFFICE_ID}`);
axios.
get(`${VITE_KCAPP_API}/tournament/current/${VITE_OFFICE_ID}`).then((response) => {
  const tournament = response.data;
  axios
  .get(`${VITE_ODDS_API}/games/meta`).then((response) => {
    const matches = response.data;
    const finished = new Set();
    for (let idx in matches) {
      const match = matches[idx];
      if (match.bets_off === 1) {
        finished.add(match.match_id);
      }
    }
    axios
    .get(`${VITE_KCAPP_API}/tournament/${tournament.id}/matches/result`).then((response) => {
      const results = response.data;
      for (let idx in results) {
        const match = results[idx];
        if (match.is_finished && !finished.has(match.match_id)) {
          const winner = match.winner_id ? match.winner_id : 0;
          debug(`Updating finished match ${match.match_id} with winner ${winner}`);

          axios
          .post(`${VITE_ODDS_API}/games/${match.id}/finish`, { match_id: match.match_id, winner_id: winner })
          .then((response) => {
            debug(`Updated Odds-API with match ${match.match_id} finished`);
          })
          .catch((error) => {
            debug(error);
          });
        }
      }
    })
    .catch((error) => {
      debug(error);
    });
  })
  .catch((error) => {
    debug(error);
  });
})
.catch((error) => {
  debug(error);
});


function markMatchStart(match) {
  if (!finishedTournaments.has(match.tournament_id)) {
    debug(`Marking tournament ${match.tournament_id} as started`);
    axios.post(`${VITE_ODDS_API}/tournament/${match.tournament_id}/start`).then((response) => {
        debug(`Updated Odds-API with tournament ${match.tournament_id} started`);
        finishedTournaments.add(match.tournament_id);
      })
      .catch((error) => {
        debug(error);
      });
  }

  axios.post(`${VITE_ODDS_API}/games/${match.id}/start`).then((response) => {
    debug(`Updated Odds-API with match ${match.id} started`);
  })
  .catch((error) => {
    debug(error);
  });
}

const warmupMatches = new Set();
kcapp.connect(() => {
  kcapp.on("warmup_started", (data) => {
    const match = data.match;
    if (!match.tournament) {
      return; // We don't care about unofficial matches
    }

    if (!warmupMatches.has(match.id)) {
      warmupMatches.add(match.id);

      if (match.tournament.is_playoffs) {
        markMatchStart(match);
      } else {
        debug(`warmup_started for match ${match.id}`);
        kcapp.connectLegNamespace(match.current_leg_id, (leg) => {
          leg.on("score_update", (data) => {
            const players = data.players;
            if (players[0].current_score < 171 || players[1].current_score < 171) {
              debug("Scores are below 171, disabling betting for match");
              leg.disconnect(); // We don't care about further scores
              markMatchStart(match);
            }
          });
        });
      }

    }
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
