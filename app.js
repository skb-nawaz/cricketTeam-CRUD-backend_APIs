const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initialisitonDBandServer = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3002, () => {
      console.log('server is running at "http://localhost:3000" ');
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initialisitonDBandServer();

//API-1 GET ALL PLAYERS

app.get("/players/", async (request, response) => {
  const allPlayersQuery = `SELECT * from cricket_team;`;
  const playersArray = await db.all(allPlayersQuery);
  const convertToPascalCase = playersArray.map((dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  });
  response.send(convertToPascalCase);
});

//API-2 create a new player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
        ( 
        '${player_name}',
        ${jersey_number},
        '${role}'
      );`;
  const updated = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API-3 GET ONE OBJECT OF OUR WANT

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `select * from cricket_team where player_id=${playerId};`;
  const dbObject = await db.get(playerQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  response.send(convertDbObjectToResponseObject(dbObject));
});

//API-4 update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API-5 DELETE API

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePalyerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  await db.run(deletePalyerQuery);
  response.send("Player Removed");
});

module.exports = app;
