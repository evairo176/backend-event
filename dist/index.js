"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const middlewares_1 = require("./middlewares");
const app_config_1 = require("./config/app.config");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const passport_1 = __importDefault(require("./middlewares/passport"));
const route_1 = __importDefault(require("./docs/route"));
const session_routes_1 = __importDefault(require("./modules/session/session.routes"));
const mfa_routes_1 = __importDefault(require("./modules/mfa/mfa.routes"));
const scheduler_1 = require("./libs/scheduler");
const app = (0, express_1.default)();
const BASE_PATH = app_config_1.config.BASE_PATH;
// Add JSON middleware to parse incoming requests
app.use(express_1.default.json({ limit: '100mb' })); // Ubah limit menjadi 50MB
app.use(express_1.default.urlencoded({ extended: true })); // Ubah limit menjadi 50MB
// Use Helmet to secure Express app by setting various HTTP headers
app.use((0, helmet_1.default)());
//set coookie
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
// Enable CORS with various options
app.use((0, cors_1.default)({
    // origin: '*',
    // origin: config.APP_ORIGIN,
    credentials: true,
}));
// Use Morgan middleware for logging requests UPDATE
app.use(middlewares_1.morganMiddleware);
// app.use(express.static('public'));
app.use('/public/uploads', express_1.default.static('public/uploads'));
app.get('/', (req, res) => {
    res.status(200).send(`Hello, TypeScript with Express!`);
});
app.use(`${BASE_PATH}`, auth_routes_1.default);
app.use(`${BASE_PATH}`, session_routes_1.default);
app.use(`${BASE_PATH}`, mfa_routes_1.default);
(0, route_1.default)(app);
// scheduler
(0, scheduler_1.scheduleErrorLogCleanup)();
app.use(middlewares_1.errorHandler);
app.use(middlewares_1.notFound);
// Start the server and export the server instance
const server = app.listen(app_config_1.config.PORT, () => {
    console.log(`Server is running on http://localhost:${app_config_1.config.PORT}${BASE_PATH} in ${app_config_1.config.NODE_ENV}`);
});
exports.server = server;
exports.default = app; // Tambahkan ini agar Vercel bisa menangkap aplikasi
