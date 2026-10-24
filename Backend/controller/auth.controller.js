import crypto from 'crypto';
import userModel from '../models/user.model.js';
import { sendEmail } from '../services/mail.service.js';
import { verificationEmail, resetPasswordEmail } from '../services/email.templates.js';
import { getFrontendUrl } from '../config/urls.js';
import jwt from 'jsonwebtoken';

const VERIFY_PURPOSE = 'verify-email';
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const authCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};

async function sendVerificationEmail(user) {
    const token = jwt.sign(
        { email: user.email, purpose: VERIFY_PURPOSE },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const link = `${getFrontendUrl()}/verify-email?token=${token}`;

    await sendEmail(
        user.email,
        "Verify your Perplexity account",
        verificationEmail({ username: user.username, link })
    );
}


export const register = async (req, res) => {

    const { username, email, password } = req.body

    const isUserExists = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (isUserExists) {
        return res.status(400).json({
            message: `Username or email already exists`,
            success: false
        })
    }

    const user = await userModel.create({
        username,
        email,
        password
    })

    await sendVerificationEmail(user);

    res.status(201).json({
        message: 'User created successfully',
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export const login = async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: 'User not found',
            err: "email not found",
            success: false
        })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: 'Invalid email or password',
            err: "invalid credentials",
            success: false
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: 'Please verify your email before logging in',
            err: "email not verified",
            success: false
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie('token', token, authCookieOptions())

    res.status(200).json({
        message: 'User logged in successfully',
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })
}

export const getMe = async (req, res) => {
    const userId = req.user.id

    const user = await userModel.findById(userId).select('-password')

    if (!user) {
        return res.status(404).json({
            message: 'User not found',
            success: false
        })
    }

    res.status(200).json({
        message: 'User information retrieved successfully',
        success: true,
        user
    })
}

/**
 * @route POST /api/auth/verify-email
 * @body { token }
 * Called by the frontend /verify-email page with the token from the email link.
 */
export const verifyEmail = async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.purpose !== VERIFY_PURPOSE) {
            throw new Error('Wrong token purpose')
        }

        const user = await userModel.findOne({ email: decoded.email })

        if (!user) {
            return res.status(400).json({
                message: 'Invalid verification link',
                success: false
            })
        }

        if (user.verified) {
            return res.status(200).json({
                message: 'Your email is already verified',
                success: true
            })
        }

        user.verified = true;
        await user.save();

        return res.status(200).json({
            message: 'Email verified successfully',
            success: true
        })

    } catch (err) {
        return res.status(400).json({
            message: err.name === 'TokenExpiredError'
                ? 'This verification link has expired'
                : 'Invalid verification link',
            success: false
        })
    }
}

/**
 * @route POST /api/auth/resend-verification
 * @body { email }
 * Always answers the same way so it can't be used to find out which emails are registered.
 */
export const resendVerification = async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (user && !user.verified) {
        try {
            await sendVerificationEmail(user);
        } catch (err) {
            console.error("Could not send verification email:", err.message);
        }
    }

    res.status(200).json({
        message: 'If that account exists and is not verified yet, we have sent a new verification link.',
        success: true
    })
}

/**
 * @route POST /api/auth/forgot-password
 * @body { email }
 * Always answers the same way so it can't be used to find out which emails are registered.
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (user) {
        const rawToken = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = hashToken(rawToken);
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await user.save();

        const link = `${getFrontendUrl()}/reset-password?token=${rawToken}`;

        try {
            await sendEmail(
                user.email,
                "Reset your Perplexity password",
                resetPasswordEmail({ username: user.username, link })
            );
        } catch (err) {
            console.error("Could not send reset email:", err.message);
        }
    }

    res.status(200).json({
        message: 'If an account exists for that email, we have sent a password reset link.',
        success: true
    })
}

/**
 * @route POST /api/auth/reset-password
 * @body { token, password }
 */
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    const user = await userModel.findOne({
        resetPasswordToken: hashToken(token),
        resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
        return res.status(400).json({
            message: 'This reset link is invalid or has expired',
            success: false
        })
    }

    user.password = password; // hashed by the model's pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.verified = true; // they just proved they own this inbox
    await user.save();

    res.status(200).json({
        message: 'Password reset successfully. You can now sign in.',
        success: true
    })
}
