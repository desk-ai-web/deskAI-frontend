import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupSecurity } from "./middleware/security";
import { healthCheck, readinessCheck } from "./middleware/healthCheck";
import { errorHandler } from "./utils/errorHandler";
import logger from "./logger";

const app = express();

// Setup security middleware
setupSecurity(app);

// Don't parse JSON for webhook routes - they need raw body
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: false }));

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test database connection
  // try {
  //   const testUser = await db.select().from(users).limit(1);
  //   console.log("Database connection test successful.");
  // } catch (error) {
  //   console.error("Database connection test failed:", error);
  // }

  const server = await registerRoutes(app);

  // Use centralized error handler
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5173;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`Server started on port ${port} in ${process.env.NODE_ENV} mode`);
  });
})();
