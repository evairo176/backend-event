import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, morganMiddleware, notFound } from './middlewares';
import { config } from './config/app.config';
import authRoutes from './modules/auth/auth.routes';
import passport from './middlewares/passport';
import sessionRoutes from './modules/session/session.routes';
import mfaRoutes from './modules/mfa/mfa.routes';
import path from 'path';
import { scheduleErrorLogCleanup } from './libs/scheduler';
import { setupSwagger } from './docs/swagger';

const app = express();
const BASE_PATH = config.BASE_PATH;

// Add JSON middleware to parse incoming requests
app.use(express.json({ limit: '100mb' })); // Ubah limit menjadi 50MB
app.use(express.urlencoded({ extended: true })); // Ubah limit menjadi 50MB
// Use Helmet to secure Express app by setting various HTTP headers
app.use(helmet());
//set coookie
app.use(cookieParser());
app.use(passport.initialize());
// Enable CORS with various options
app.use(
  cors({
    // origin: '*',
    // origin: config.APP_ORIGIN,
    credentials: true,
  }),
);
// Use Morgan middleware for logging requests UPDATE
app.use(morganMiddleware);

// app.use(express.static('public'));
app.use('/public/uploads', express.static('public/uploads'));

app.get('/', (req, res) => {
  res.status(200).send(`Hello, TypeScript with Express!`);
});

app.use(`${BASE_PATH}`, authRoutes);
app.use(`${BASE_PATH}`, sessionRoutes);
app.use(`${BASE_PATH}`, mfaRoutes);

// ✅ Serve static files (favicon, etc.)
app.use('/public', express.static(path.join(__dirname, '../public')));

// ✅ Serve Swagger UI
app.use(
  '/swagger-ui',
  express.static(path.join(__dirname, '../public/swagger-ui')),
);

// Setup Swagger
setupSwagger(app);

// scheduler
if (process.env.NODE_ENV !== 'test') {
  scheduleErrorLogCleanup();
}

app.use(errorHandler);
app.use(notFound);

// Start the server and export the server instance
const server = app.listen(config.PORT, () => {
  console.log(
    `Server is running on http://localhost:${config.PORT}${BASE_PATH} in ${config.NODE_ENV}`,
  );
  console.log(
    `Swagger documentation available at http://localhost:${config.PORT}/api-docs`,
  );
});

export { server };
export default app; // Tambahkan ini agar Vercel bisa menangkap aplikasi
