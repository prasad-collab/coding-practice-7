const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite.Database,
    });
    app.listen(3011, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//get player details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details`;
  const getPlayers = await db.all(getPlayersQuery);
  response.send(getPlayers);
});
//get player Details based on playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayersQuery = `SELECT * FROM player_details`;
  const getSinglePlayer = await db.get(getSinglePlayersQuery);
  response.send(getSinglePlayer);
});

//get update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerDetailsQuery = `UPDATE player_details
    SET
    player_name='${playerName}'
    WHERE player_id=${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

//get match details
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `SELECT * FROM match_details`;
  const getMatchDetails = await db.all(getMatchDetailsQuery);
  response.send(getMatchDetails);
});

//return match of players

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchQuery = `SELECT  match_id AS matchId,
  match,
  year
  FROM 
  player_match_score NATURAL JOIN  match_details
    WHERE 
    player_id='${playerId}';`;
  const playerMatchDetails = await db.all(playerMatchQuery);
  response.send(playerMatchDetails);
});

//
