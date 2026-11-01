import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html, extra = {}) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is missing");
        }

        if (!process.env.EMAIL_FROM) {
            throw new Error("EMAIL_FROM is missing");
        }

        if (!to || !subject || !html) {
            throw new Error("Recipient, subject and email content are required");
        }
        
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            ...extra
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(error.message || "Email sending failed");
        }

        console.log("Email sent successfully:", data.id);

        return {
            success: true,
            messageId: data.id
        };

    } catch (error) {
        console.error("Email Service Error:", error.message);
        throw error;
    }
};