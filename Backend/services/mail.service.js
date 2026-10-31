
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN_SECRET
    },

    requireTLS: true,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
});

transporter.verify()
    .then(() => {
        console.log("Nexora email service is ready.");
    })
    .catch((err) => {
        console.error("Email service error:", err);
    });

export const sendEmail = async (to, subject, html, extra = {}) => {
    const mailOptions = {
        from: {
            name: "Nexora",
            address: process.env.GOOGLE_USER
        },
        to,
        subject,
        html,
        ...extra
    };

    const response = await transporter.sendMail(mailOptions);

    console.log("Email sent:", response.messageId);

    return response;
};