import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getForgetPasswordEmailBody, getVerficationHtmlBody } from "../helpers/constant.js";

dotenv.config();

let transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    secure: false,
    auth: {
        user: process.env.SMPT_USER,
        pass: process.env.SMPT_PASS
    }
});

// returns the verificationToken
export async function sendEmailVerificationService(email: string, firstname: string, verificationToken: string) {
    const verificationUrl = `${process.env.EMAIL_VERIFICATION_URL}?token=${verificationToken}`;

    console.log(`sending the email... URL: ${verificationUrl}`);
    await transporter.sendMail({
        from: 'Matcha <no-reply@myapp.com>',
        to: email,
        subject: 'Matcha Email Verification',
        html: getVerficationHtmlBody(verificationUrl, firstname)
    });
    
    console.log('verification email sent!');
}

export async function sendForgetPasswordEmailService(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.EMAIL_PASSWORD_RESET_URL}?token=${resetToken}`;

    await transporter.sendMail({
        from: 'Matcha <no-reply@myapp.com>',
        to: email,
        subject: 'Password Reset',
        html: getForgetPasswordEmailBody(resetUrl, email)
    });
}
