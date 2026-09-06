import express from "express";
import apiRouter from "./routes/apiRoutes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use("/api", apiRouter);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "cognibloom-api",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`CogniBloom API listening on http://localhost:${port}`);
});