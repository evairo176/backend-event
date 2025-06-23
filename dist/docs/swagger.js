"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("./swagger-output.json")); // hasil generate dari step 1
const setupSwagger = (app) => {
    app.use('/v1/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
    app.get('/api-docs/swagger.json', (_, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swagger_output_json_1.default);
    });
    app.get('/api-docs', (_, res) => {
        res.redirect('/v1/api-docs');
    });
};
exports.setupSwagger = setupSwagger;
