import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors middleware
import { colors } from './utils/colors';

// Import routers
import authRouter from './api/routes/auth.routes';
import userRouter from './api/routes/user.routes';
import webhookRouter from './api/routes/webhook.routes';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8081;
const app: Express = express();

// --- Define Routes and Middleware in Correct Order ---

// --- Step 1: Add CORS Middleware ---
// This will allow your frontend on localhost:3000 to make requests to this backend.
app.use(cors({
  origin: 'http://localhost:3000' // Be specific about the origin for security
}));

// The webhook router must be registered BEFORE the global express.json() parser.
app.use('/webhook', webhookRouter);

// This global middleware parses JSON for all other routes that come after it.
app.use(express.json()); 

// Register the rest of the API routes
app.use('/', authRouter);
app.use('/', userRouter);

app.get('/', (req: Request, res: Response) => {
    res.send("Server is running.");
});

// --- Centralized Error Handler ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`${colors.red}Unhandled Error: ${err.stack}${colors.reset}`);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

// --- Start the HTTP Server ---
app.listen(PORT, () => {
  console.log(`Server running on ${colors.green}http://localhost:${PORT}${colors.reset}`);
});
