import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from '../routes/auth.routes.js'
import chatRouter from '../routes/chat.routes.js'
import cors from 'cors'
import morgan from 'morgan'
import { getFrontendUrl } from '../config/urls.js'

const app = express()

app.set('trust proxy', 1)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://nexora-olive-three.vercel.app",
    'https://nexora-9o65klcof-vijaym105s-projects.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error(`CORS blocked for origin: ${origin}`)
        );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app