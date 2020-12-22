"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const logging_1 = __importDefault(require("./config/logging"));
const config_1 = __importDefault(require("./config/config"));
const routes_1 = __importDefault(require("./routes"));
const Socket_1 = __importDefault(require("./controllers/Socket"));
const NAMESPACE = "Server";
const router = express_1.default();
/** Log the request */
router.use((req, res, next) => {
    logging_1.default.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`, NAMESPACE);
    next();
});
/** Parse the body of the request */
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.use(body_parser_1.default.json());
/** Rules of our API */
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method == "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
/** Routes go here */
router.use("/api/sample", routes_1.default);
/** Error handling */
router.use((req, res, next) => {
    const error = new Error("Not found");
    res.status(404).json({
        message: error.message,
    });
});
const server = require("http").Server(router);
Socket_1.default(server);
server.listen(config_1.default.server.port, () => logging_1.default.info(NAMESPACE, `Server is running ${config_1.default.server.hostname}:${config_1.default.server.port}`));
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
//# sourceMappingURL=index.js.map