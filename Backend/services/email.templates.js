const SUPPORT_EMAIL = "vjmalusare10@gmail.com";

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

function layout({ title, username, paragraphs, buttonLabel, link, expiryTitle, expiryText, ignoreNote }) {
    const safeName = escapeHtml(username);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>

<body style="margin: 0; padding: 0; background-color: #f3f6f7; font-family: Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f6f7; padding: 40px 15px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 18px; overflow: hidden;">

                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="background-color: #071013; padding: 40px 30px;">
                            <div style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -1px;">✦ Nexora</div>
                            <div style="margin-top: 10px; font-size: 15px; color: #aeb8bd;">Search Smarter. Think Deeper.</div>
                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 45px 40px;">

                            <h1 style="margin: 0 0 20px 0; color: #172b3a; font-size: 32px; line-height: 1.2; font-weight: 700;">Hello ${safeName},</h1>

                            ${paragraphs.map((p) => `<p style="margin: 0 0 20px 0; color: #34495e; font-size: 17px; line-height: 1.7;">${p}</p>`).join("\n")}

                            <!-- BUTTON -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
                                <tr>
                                    <td align="center">
                                        <a href="${link}" style="display: inline-block; background-color: #071013; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 17px 42px; border-radius: 10px;">
                                            ${buttonLabel} &nbsp; →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 18px 0 0 0; color: #8a949e; font-size: 13px; line-height: 1.6; word-break: break-all; text-align: center;">
                                Or paste this link into your browser:<br>${link}
                            </p>

                            <!-- EXPIRY BOX -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 35px; background-color: #effaf5; border: 1px solid #ccefe0; border-radius: 12px;">
                                <tr>
                                    <td width="65" align="center" valign="middle" style="padding: 20px 5px 20px 15px;">
                                        <div style="width: 40px; height: 40px; line-height: 40px; background-color: #d9f6e8; border-radius: 50%; font-size: 20px;">✓</div>
                                    </td>
                                    <td valign="middle" style="padding: 20px 15px 20px 5px;">
                                        <div style="color: #176b4c; font-size: 16px; font-weight: 700; margin-bottom: 5px;">${expiryTitle}</div>
                                        <div style="color: #527166; font-size: 14px; line-height: 1.5;">${expiryText}</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- SECURITY NOTE -->
                            <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #667085; font-size: 14px; line-height: 1.7;">${ignoreNote}</p>
                            </div>

                            <!-- SIGNATURE -->
                            <div style="margin-top: 28px;">
                                <p style="margin: 0 0 5px 0; color: #52606d; font-size: 15px;">Best regards,</p>
                                <p style="margin: 0; color: #172b3a; font-size: 16px; font-weight: 700;">The Nexora Team</p>
                            </div>

                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="background-color: #f8fafb; border-top: 1px solid #e5e7eb; padding: 28px 30px;">
                            <p style="margin: 0 0 15px 0; color: #667085; font-size: 14px;">Curious minds build a better tomorrow.</p>
                            <p style="margin: 0; color: #8a949e; font-size: 13px;">
                                For help, contact us at
                                <a href="mailto:${SUPPORT_EMAIL}" style="color: #1677ff; text-decoration: none;">${SUPPORT_EMAIL}</a>
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`;
}

/**
 * An email the user wrote (or the AI drafted and the user approved) and sent from the app.
 * The footer makes it clear who it is really from, because it is sent from the app's mailbox.
 */
export function userComposedEmail({ senderName, senderEmail, body }) {
    const safeBody = escapeHtml(body).replace(/\r?\n/g, "<br>");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 24px 15px; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; color: #1f2933; font-size: 16px; line-height: 1.6;">
        ${safeBody}
        <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #8a949e; font-size: 12px; line-height: 1.5;">
            Sent via Nexora on behalf of ${escapeHtml(senderName)} (${escapeHtml(senderEmail)}).
            Reply to this email to respond to them directly.
        </p>
    </div>
</body>
</html>
`;

    const text = `${body}\n\n--\nSent via Nexora on behalf of ${senderName} (${senderEmail}). Reply to this email to respond to them directly.`;

    return { html, text };
}

export function verificationEmail({ username, link }) {
    return layout({
        title: "Verify your Nexora account",
        username,
        paragraphs: [
            `Thank you for registering with <strong style="color: #172b3a;">Nexora</strong>. We're excited to have you on board.`,
            `Please verify your email address to activate your account and start exploring a smarter way to search.`,
        ],
        buttonLabel: "Verify Email",
        link,
        expiryTitle: "This link will expire in 15 minutes.",
        expiryText: "For your security, please complete the verification within this time.",
        ignoreNote: "If you didn't create a Nexora account, you can safely ignore this email. Your account won't be activated.",
    });
}

export function resetPasswordEmail({ username, link }) {
    return layout({
        title: "Reset your Nexora password",
        username,
        paragraphs: [
            `We received a request to reset the password for your <strong style="color: #172b3a;">Nexora</strong> account.`,
            `Click the button below to choose a new password.`,
        ],
        buttonLabel: "Reset Password",
        link,
        expiryTitle: "This link will expire in 15 minutes.",
        expiryText: "For your security, the link can only be used once.",
        ignoreNote: "If you didn't request a password reset, you can safely ignore this email. Your password won't change.",
    });
}
