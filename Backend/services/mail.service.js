import nodemailer from "nodemailer";

// Why this is not plain SMTP: Render's free web services block outbound SMTP ports
// (25, 465, 587), so smtp.gmail.com times out when deployed even though it works on
// localhost. Instead we send through the Gmail API over HTTPS (port 443), which no host
// blocks. It uses the SAME Google OAuth2 credentials you already have:
//   GOOGLE_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_TOKEN_SECRET
// (the refresh token must have been created with the https://mail.google.com/ scope,
// which is also what SMTP OAuth2 needs).
//
// MAIL_TRANSPORT=smtp switches back to SMTP (only useful on a host that allows it).

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const REQUEST_TIMEOUT_MS = 20000;

const useSmtp = () => String(process.env.MAIL_TRANSPORT).toLowerCase() === "smtp";

// ---------- Gmail API over HTTPS ----------
let cachedToken = { value: null, expiresAt: 0 };

async function getAccessToken() {
    if (cachedToken.value && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.value;

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID ?? "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            refresh_token: process.env.REFRESH_TOKEN_SECRET ?? "",
            grant_type: "refresh_token",
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.access_token) {
        throw new Error(`Google OAuth failed (${res.status}): ${data.error_description || data.error || "no access token"}`);
    }

    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
    return cachedToken.value;
}

// nodemailer builds the MIME message (headers, encoding, html+text); nothing is sent by it
const mimeBuilder = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });

async function sendWithGmailApi(mailOptions) {
    const { message } = await mimeBuilder.sendMail(mailOptions);
    const raw = message.toString("base64url");

    const res = await fetch(SEND_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        if (res.status === 401) cachedToken = { value: null, expiresAt: 0 };
        throw new Error(`Gmail API failed (${res.status}): ${data.error?.message || "unknown error"}`);
    }

    return { messageId: data.id };
}

// ---------- SMTP (optional) ----------
let smtpTransporter;

function sendWithSmtp(mailOptions) {
    smtpTransporter ??= nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            type: "OAuth2",
            user: process.env.GOOGLE_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN_SECRET,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
    });
    return smtpTransporter.sendMail(mailOptions);
}

export const sendEmail = async (to, subject, html, extra = {}) => {
    const mailOptions = {
        from: {
            name: "Nexora",
            address: process.env.GOOGLE_USER,
        },
        to,
        subject,
        html,
        ...extra,
    };

    const response = useSmtp() ? await sendWithSmtp(mailOptions) : await sendWithGmailApi(mailOptions);

    console.log("Email sent:", response.messageId);

    return response;
};

// Checked once at startup so a wrong credential shows up in the Render logs right away.
// Never throws and never blocks the server.
if (!useSmtp()) {
    getAccessToken()
        .then(() => console.log("Nexora email service is ready (Gmail API over HTTPS)."))
        .catch((err) => console.error("Email service error:", err.message));
}