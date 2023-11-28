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
  const getSinglePlayersQuery = `SELECT * FROM player_details WHERE player_id=${playerId}`;
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
  const getMatchDetailsQuery = `SELECT * FROM match_details WHERE match_id=${matchId}`;
  const getMatchDetails = await db.all(getMatchDetailsQuery);
  response.send(getMatchDetails);
});

//return match of players

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchQuery = `
        SELECT 
            match_id AS matchId,
            match,
            year
        FROM
            player_match_score NATURAL JOIN match_details
        WHERE
            player_id = ${playerId};`;
  const playerMatchDetails = await db.all(playerMatchQuery);
  response.send(playerMatchDetails);
});

//API6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const api6Query = `
            SELECT 
                player_match_score.player_id AS playerId,
                player_name AS playerName
                FROM 
                    player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
                WHERE
                    match_id=${matchId};`;
  const playerMatch = await db.all(api6Query);
  response.send(playerMatch);
});
//api7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const api7Query = `
        SELECT 
            player_details.player_id AS playerId,
            player_details.player_name AS playerName,
            SUM(player_match_score.score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes
        FROM
            player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
        WHERE
            player_details.player_id = ${playerId};`;
  const playerScore = await db.all(api7Query);
  response.send(playerScore);
});

module.exports = app;
