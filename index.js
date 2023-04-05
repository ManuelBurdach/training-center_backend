// --------------------------------------------------- IMPORTS
import express from "express";
import cors from "cors";
import "./config/config.js";
import morgan from "morgan";
import { body, validationResult } from "express-validator";

// --------------------------------------------------- CONSTS
const PORT = process.env.PORT || 10000;
/* in RENDER.com : import.meta.env.VITE_BASELINK || */
const BASELINK = process.env.VITE_BASELINK + PORT || "http://localhost:" + PORT;

const DBstatic = {
  priceProHuman: 1500,
  capacity: 100,
};

const DBvariable = {
  accountBalance: 0,
  sellHistory: [],
  humansCounter: 0,
  humansHistory: [],
};

// --------------------------------------------------- SERVER
const app = express();

// --------------------------------------------------- MIDDLEWARE
app.use(morgan("dev"));
app.use(cors({ origin: BASELINK }));
app.use(express.json());

// --------------------------------------------------- GET account
app.get("/api/v1/account", (req, res) => {
  res.json(DBvariable);
});

// --------------------------------------------------- PUT humans
app.put("/api/v1/humans", body("humans").isLength({ min: 1, max: 2 }).isNumeric(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json([{ err: errors.array(), ...DBvariable }]);
  }

  const humans = Number(req.body.humans);
  if (DBstatic.capacity < DBvariable.humansCounter + humans) {
    return res.json({ err: true, ...DBvariable });
  }

  const timestamp = new Date().getTime();
  const newHumans = {
    manyHumans: humans,
    timestamp: timestamp,
  };

  DBvariable.humansCounter += humans;
  DBvariable.humansHistory.push(newHumans);

  res.json({ err: false, ...DBvariable });
});

// --------------------------------------------------- PUT sellHumans
app.put("/api/v1/sellHumans", (req, res) => {
  let timestamp = new Date().getTime();
  const newSell = {
    manyHumans: DBvariable.humansCounter,
    intake: DBvariable.humansCounter * DBstatic.priceProHuman,
    timestamp: timestamp,
  };

  DBvariable.accountBalance += DBvariable.humansCounter * DBstatic.priceProHuman;
  DBvariable.humansCounter = 0; //reset humansCounter
  DBvariable.sellHistory.push(newSell);
  DBvariable.humansHistory = []; //reset humansHistory

  res.json(DBvariable);
});

// --------------------------------------------------- SERVER LISTEN PORT
app.listen(PORT, () => console.log("Server listen on port:", PORT));
