import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import authRouter from "./app/modules/auth/auth.route";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use("/api/auth", authRouter);


app.get("/", (req: Request, res: Response) => {
  res.send({
    status: true,
    message: "Server live",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;