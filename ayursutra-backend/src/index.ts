import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes";
import {
  connectWithRetry,
  getConnectionStatus,
} from "./config/mongodb-fallback";
import {
  connectToDatabase,
  ensureConnection,
} from "./config/mongodb-serverless";

dotenv.config();

export function createApp() {
  const app = express();

  const allowedOrigins = [
    // Primary origins from env (comma-separated supported)
    ...(process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : []),
    ...(process.env.NEXT_PUBLIC_APP_ORIGIN
      ? [process.env.NEXT_PUBLIC_APP_ORIGIN]
      : []),
    // Production frontend URLs

    "https://ayursutra-care.vercel.app",
    // Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  const isOriginAllowed = (origin: string) => {
    if (allowedOrigins.includes(origin)) return true;
    // Allow any Vercel preview/frontends for this project
    if (origin.endsWith(".vercel.app")) return true;
    // Allow localhost variations
    if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
    return false;
  };

  const corsOptions: cors.CorsOptions = {
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    optionsSuccessStatus: 204,
  };

  // Set Vary header for proxies/CDNs and apply CORS early
  app.use((req, res, next) => {
    res.setHeader("Vary", "Origin");
    next();
  });
  app.use(cors(corsOptions));
  // Express v5: use regex for catch-all preflight handling
  app.options(/.*/, cors(corsOptions));
  app.use(express.json());

  const resolvedMongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://prince844121_db_user:chaman123@cluster0.yilecha.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

  // Track last connection error for diagnostics
  let lastMongoError: string | null = null;

  // Debug logging for MongoDB connection
  console.log("🔍 MongoDB Connection Debug Info:");
  console.log("📍 Environment:", process.env.NODE_ENV || "development");
  console.log("🌐 Platform:", process.env.VERCEL ? "Vercel" : "Local");
  console.log("🔗 MONGO_URI from env:", !!process.env.MONGO_URI);
  console.log("📝 Resolved URI:", resolvedMongoUri ? "✅ Set" : "❌ Empty");

  if (resolvedMongoUri) {
    try {
      const uri = new URL(
        resolvedMongoUri
          .replace("mongodb+srv://", "https://")
          .replace("mongodb://", "http://")
      );
      console.log("🏠 MongoDB Host:", uri.hostname);
      console.log("🔌 MongoDB Port:", uri.port || "default");
    } catch (e) {
      console.log("⚠️ Could not parse MongoDB URI for host info");
    }
  }

  if (!resolvedMongoUri) {
    console.error("❌ MONGO_URI environment variable is required");
  } else {
    // Set up connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
      console.log("📊 Connection State:", mongoose.connection.readyState);
      console.log(
        "🏠 Connected to:",
        mongoose.connection.host,
        ":",
        mongoose.connection.port
      );
      console.log("🗄️ Database:", mongoose.connection.name);
      lastMongoError = null;
    });

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      console.error("🔍 Error details:", {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        codeName: (error as any)?.codeName,
        reason: (error as any)?.reason,
      });
      try {
        lastMongoError = (error as any)?.message || String(error);
      } catch {
        lastMongoError = "Unknown MongoDB error";
      }
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      console.log("📊 Connection State:", mongoose.connection.readyState);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      console.log("📊 Connection State:", mongoose.connection.readyState);
    });

    // Attempt connection with retry
    console.log("🚀 Attempting MongoDB connection...");
    console.log(
      "🔗 Using URI:",
      resolvedMongoUri.replace(/\/\/.*@/, "//***:***@")
    ); // Hide credentials in logs
    console.log("⚙️ Connection options:", {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: "majority",
      directConnection: false,
      retryReads: true,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });

    mongoose
      .connect(resolvedMongoUri, {
        // Serverless-optimized connection options
        maxPoolSize: 1, // Single connection for serverless
        serverSelectionTimeoutMS: 15000, // Increased timeout for cold starts
        socketTimeoutMS: 60000, // Increased socket timeout
        bufferCommands: false,
        retryWrites: true,
        w: "majority",
        directConnection: false,
        retryReads: true,
        maxIdleTimeMS: 10000, // Close connection after 10s of inactivity
        connectTimeoutMS: 15000, // Increased connection timeout
        heartbeatFrequencyMS: 10000, // Check connection health every 10s
      })
      .then(() => {
        console.log("✅ MongoDB connection established");
        console.log(
          "📊 Final Connection State:",
          mongoose.connection.readyState
        );
        console.log("🏠 Final Host:", mongoose.connection.host);
        console.log("🗄️ Final Database:", mongoose.connection.name);
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error);
        console.error("🔍 Connection failure details:", {
          name: (error as any)?.name,
          message: (error as any)?.message,
          code: (error as any)?.code,
          codeName: (error as any)?.codeName,
          reason: (error as any)?.reason,
          stack: (error as any)?.stack,
        });
        try {
          lastMongoError = (error as any)?.message || String(error);
        } catch {
          lastMongoError = "Unknown MongoDB error";
        }
        console.log("⚠️ Server will continue without database connection");
        console.log(
          "📊 Current Connection State:",
          mongoose.connection.readyState
        );
        // Don't exit process, let server continue
      });
  }

  app.get("/health", async (req, res) => {
    try {
      // Ensure connection is healthy and active
      console.log("🏥 Health check requested");
      await ensureConnection();

      const dbState = mongoose.connection.readyState;
      const dbStatus =
        dbState === 1
          ? "connected"
          : dbState === 2
          ? "connecting"
          : dbState === 3
          ? "disconnecting"
          : "disconnected";

      // Debug logging for health check
      console.log("📊 Current MongoDB State:", dbState, "(", dbStatus, ")");
      console.log("🏠 MongoDB Host:", mongoose.connection.host || "unknown");
      console.log(
        "🗄️ MongoDB Database:",
        mongoose.connection.name || "unknown"
      );
      console.log("🔗 Has MONGO_URI:", !!process.env.MONGO_URI);
      console.log("❌ Last Error:", lastMongoError || "none");

      const isHealthy = dbState === 1;
      const healthResponse = {
        status: isHealthy ? "OK" : "UNHEALTHY",
        timestamp: new Date().toISOString(),
        database: dbStatus,
        mongoState: dbState,
        environment: process.env.NODE_ENV || "development",
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
        // MongoDB connection details
        mongoHost: mongoose.connection.host || null,
        mongoDatabase: mongoose.connection.name || null,
        mongoPort: mongoose.connection.port || null,
        // URI information
        hasMongoUri: !!process.env.MONGO_URI,
        mongoUriHost: (() => {
          try {
            const uri = new URL(
              resolvedMongoUri
                .replace("mongodb+srv://", "https://")
                .replace("mongodb://", "http://")
            );
            return uri.hostname || null;
          } catch {
            return null;
          }
        })(),
        fullMongoUri: resolvedMongoUri, // Full URI for debugging
        lastMongoError,
        // Additional connection stats
        connectionReadyState: mongoose.connection.readyState,
        connectionStates: {
          0: "disconnected",
          1: "connected",
          2: "connecting",
          3: "disconnecting",
        },
      };

      console.log(
        "📤 Health response:",
        JSON.stringify(healthResponse, null, 2)
      );
      res.status(isHealthy ? 200 : 503).json(healthResponse);
    } catch (error) {
      console.error("❌ Health check failed:", error);
      res.status(503).json({
        status: "ERROR",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: "error",
        mongoState: mongoose.connection.readyState,
        environment: process.env.NODE_ENV || "production",
      });
    }
  });

  // Alias: /api/health for convenience in some clients
  app.get("/api/health", (req, res) => {
    res.redirect(302, "/health");
  });

  // Detailed MongoDB status endpoint
  app.get("/api/mongodb-status", async (req, res) => {
    try {
      // Try to connect if not already connected
      if (mongoose.connection.readyState !== 1) {
        console.log("🔄 Attempting to connect to MongoDB...");
        await connectToDatabase();
      }

      const state = mongoose.connection.readyState;
      const status =
        state === 1
          ? "connected"
          : state === 2
          ? "connecting"
          : state === 3
          ? "disconnecting"
          : "disconnected";

      // Get detailed connection information
      const connectionInfo: any = {
        // Basic connection info
        status: status,
        readyState: state,
        host: mongoose.connection.host || "unknown",
        port: mongoose.connection.port || "unknown",
        database: mongoose.connection.name || "unknown",

        // URI information
        hasMongoUri: !!process.env.MONGO_URI,
        fullMongoUri: resolvedMongoUri,
        maskedMongoUri: resolvedMongoUri.replace(/\/\/.*@/, "//***:***@"),

        // Environment info
        environment: process.env.NODE_ENV || "development",
        uptime: Math.floor(process.uptime()),

        // System info
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,

        // Connection states reference
        connectionStates: {
          0: "disconnected",
          1: "connected",
          2: "connecting",
          3: "disconnecting",
        },

        // Error info
        lastError: lastMongoError || null,

        // Timestamp
        timestamp: new Date().toISOString(),
      };

      // If connected, try to get collection info
      if (state === 1 && mongoose.connection.db) {
        try {
          const collections = await mongoose.connection.db
            .listCollections()
            .toArray();
          connectionInfo.collections = collections.map((c) => ({
            name: c.name,
            type: c.type || "collection",
          }));
        } catch (error) {
          connectionInfo.collectionsError =
            error instanceof Error ? error.message : "Unknown error";
        }
      }

      res.json(connectionInfo);
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        readyState: mongoose.connection.readyState,
      });
    }
  });

  // Root route: show detailed MongoDB connection info
  app.get("/", (req, res) => {
    const portInfo = process.env.VERCEL
      ? "serverless"
      : `port ${process.env.PORT || 4000}`;

    const state = mongoose.connection.readyState;
    const status =
      state === 1
        ? "connected"
        : state === 2
        ? "connecting"
        : state === 3
        ? "disconnecting"
        : "disconnected";

    // Show full MongoDB URI (unmasked for debugging)
    const fullUri = resolvedMongoUri;

    // Also show masked version
    let maskedUri = "unknown";
    try {
      const uri = new URL(
        resolvedMongoUri
          .replace("mongodb+srv://", "https://")
          .replace("mongodb://", "http://")
      );
      const dbName =
        mongoose.connection.name || uri.pathname.replace("/", "") || "";
      maskedUri = `${uri.protocol.replace(":", "")}://${uri.hostname}${
        dbName ? "/" + dbName : ""
      }`;
    } catch {
      maskedUri = "unparseable-uri";
    }

    const connectionDetails = {
      state: state,
      status: status,
      host: mongoose.connection.host || "unknown",
      port: mongoose.connection.port || "unknown",
      database: mongoose.connection.name || "unknown",
      hasUri: !!process.env.MONGO_URI,
      environment: process.env.NODE_ENV || "development",
      uptime: Math.floor(process.uptime()),
    };

    const lines = [
      `AyurSutra Backend is online (${portInfo}).`,
      ``,
      `=== MONGODB CONNECTION DETAILS ===`,
      `Status: ${status} (state=${state})`,
      `Host: ${connectionDetails.host}`,
      `Port: ${connectionDetails.port}`,
      `Database: ${connectionDetails.database}`,
      `Environment: ${connectionDetails.environment}`,
      `Has MONGO_URI: ${connectionDetails.hasUri}`,
      `Uptime: ${connectionDetails.uptime}s`,
      ``,
      `=== CONNECTION URI ===`,
      `Full URI: ${fullUri}`,
      `Masked URI: ${maskedUri}`,
      ``,
      `=== ENDPOINTS ===`,
      `Health Check: /health`,
      `MongoDB Status: /api/mongodb-status`,
      `API Base: /api`,
      `Detailed Health: /api/health`,
    ];

    res.type("text/plain").send(lines.join("\n") + "\n");
  });

  app.use("/api", routes);

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 AyurSutra Backend API running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  });
}
