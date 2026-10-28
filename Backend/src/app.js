import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from '../routes/auth.routes.js'
import chatRouter from '../routes/chat.routes.js'
import cors from 'cors'
import morgan from 'morgan'
import { getFrontendUrl } from '../config/urls.js'

const app = express()
const allowedOrigins = [
    "http://localhost:5173",
    "https://nexora-9o65klcof-vijaym105s-projects.vercel.app"
];
app.set('trust proxy', 1)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app