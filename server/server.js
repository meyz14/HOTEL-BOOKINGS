import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkMiddlewareOptions, AUTHORIZED_PARTIES } from "./configs/clerkAuth.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";



const app = express();

await connectDB();
connectCloudinary();

app.use(
  cors({
    origin: AUTHORIZED_PARTIES,
    credentials: true,
  })
);

//API to listen to Stripe Webhooks
app.use("/api/stripe", express.raw({type: 'application/json'}), stripeWebhooks);

app.use(express.json());
app.use(clerkMiddleware(clerkMiddlewareOptions));

//API to listen to Clerk Webhooks
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is working"));

app.get("/api/health", (req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ];
  res.json({
    success: true,
    database: dbState,
    dbName: mongoose.connection.name || null,
  });
});

app.use('/api/user', userRouter)
app.use('/api/hotels', hotelRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);