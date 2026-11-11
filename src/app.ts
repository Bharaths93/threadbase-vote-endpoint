import express, { type Request, type Response, type NextFunction } from "express";
import { postsRouter } from "./routes/posts.js";

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

const app = express();

// Body parser
app.use(express.json());

// Stub auth middleware: sets req.user = { id: 1 }
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.user = { id: 1 };
  next();
});

// Mount posts router
app.use("/posts", postsRouter);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
export { app };
