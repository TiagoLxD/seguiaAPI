import cors from "cors";
import express, { json } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import routes from "./routes/routes";

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
});

app.use(helmet());
app.use(limiter);

const corsOptions = {
	origin: "http://localhost:4200",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
};

app.use(cors(corsOptions));
app.use(json());

app.use("/api", routes);

export default app;
