import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "typescript-rest";

import logging from "./config/logging";
import config from "./config/config";
import sampleRoutes from "./routes";
import { Socket } from "dgram";
import connect from "./controllers/Socket";

const NAMESPACE = "Server";
const router = express();
/** Log the request */
router.use((req, res, next) => {
  logging.info(
    `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`,
    NAMESPACE
  );

  next();
});

/** Parse the body of the request */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/** Rules of our API */
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

/** Routes go here */
router.use("/api/sample", sampleRoutes);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("Not found");

  res.status(404).json({
    message: error.message,
  });
});

const server = require("http").Server(router);
connect(server);
server.listen(config.server.port, () =>
  logging.info(
    NAMESPACE,
    `Server is running ${config.server.hostname}:${config.server.port}`
  )
);

// Importing all handlers
// import "./controllers";
// import { TryDBConnect } from "./helpers";

// export const app: express.Application = express();

// app.use(cors());
// app.use(bodyParser.json());

// app.use(async (req: Request, res: Response, next) => {
//   await TryDBConnect(() => {
//     res.json({
//       error: "Database connection error, please try again later",
//     });
//   }, next);
// });

// Server.buildServices(app);

// // Just checking if given PORT variable is an integer or not
// let port = parseInt(process.env.PORT || "");
// if (isNaN(port) || port === 0) {
//   port = 4000;
// }

// app.listen(port, "0.0.0.0", () => {
//   console.log(`🚀 Server Started at PORT: ${port}`);
// });
