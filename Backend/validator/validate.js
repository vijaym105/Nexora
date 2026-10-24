import {body, validationResult} from 'express-validator';

export function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateRegister = [
    body('username').isString().withMessage("Username must be a string").notEmpty().withMessage("Username is required"),
    body('email').isEmail().withMessage("Valid email is required"),
    body('password').isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    validate   
]

export const validateSendEmailDraft = [
    body('messageId').isMongoId().withMessage("A valid messageId is required"),
    body('to').isString().trim().isEmail().withMessage("Enter one valid recipient email address"),
    body('subject').isString().trim().notEmpty().withMessage("Subject is required").isLength({max: 200}).withMessage("Subject must be 200 characters or fewer"),
    body('body').isString().trim().notEmpty().withMessage("Email body is required").isLength({max: 10000}).withMessage("Email body must be 10,000 characters or fewer"),
    validate
]

export const validateVerifyEmail = [
    body('token').isString().notEmpty().withMessage("Token is required"),
    validate
]

export const validateEmailOnly = [
    body('email').isEmail().withMessage("Valid email is required"),
    validate
]

export const validateResetPassword = [
    body('token').isString().notEmpty().withMessage("Token is required"),
    body('password').isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    validate
]

export const validateLogin = [
    body('email').isEmail().withMessage("Valid email is required"),
    body('password').notEmpty().withMessage("Password is required"),
    validate    
]