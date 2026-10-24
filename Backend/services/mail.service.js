import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        clientId: process.env.GOOGLE_CLIENT_ID,
        refreshToken: process.env.REFRESH_TOKEN_SECRET
    }
});

transporter.verify()
    .then(() => {
        console.log("Nexora email service is ready.");
    })
    .catch((err) => {
        console.error("Email service error:", err.message);
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

    const res = await transporter.sendMail(mailOptions);

    console.log("Email sent:", res.messageId);

    return res;
};