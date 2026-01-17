import { BriefProfileInfo, ProfileInfo } from "../types/profile.js";

type User = {
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    hashedPassword: string;
    passwordSalt: string;
    isValidated?: boolean;
    resetToken?: string;
};

type Token = {
    userId: number;
    token: string;
};

type VerificationTokens = {
    currentMaxId: number;
    tokens: Token[];
}

export const users: User[] = [];

export const verificationTokens: VerificationTokens = { currentMaxId: 0, tokens: [] };

export function getVerficationHtmlBody(verificationUrl: string, firstname: string): string {
    return (`        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #2c3e50;">Welcome to MatchaApp!</h2>
                <p style="font-size: 16px;">Hi ${firstname},</p>
                <p style="font-size: 16px;">Thank you for registering with Matcha. So you're here to find your perfect match, please click the link below to continue:</p>
                <p style="text-align: center;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; background-color: #3498db; text-decoration: none; border-radius: 5px;">Continue</a>
                </p>
                <p style="font-size: 14px; color: #777;">If you did not create an account, please ignore this email.</p>
                <p style="font-size: 14px; color: #777;">Best regards,<br>MatchaApp Team</p>
            </div>
        </body>
        </html>`)
}

export function getForgetPasswordEmailBody(resetUrl: string, email: string): string {
    return (
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                <p style="color: #555;">You are receiving this email because you (or someone else) have requested to reset the password for your account. Please click the button below to reset your password:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Reset Password</a>
                </div>
                <p style="color: #555;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p style="color: #555;">Thank you,<br>Your Website Team</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa; text-align: center;">This email was sent to ${email}. If you have any questions, please contact our support team.</p>
            </div>`
    )
}

// export let dummyProfileInfo: ProfileInfo[] = [
//     {
//         userInfo: {
//             id: '1',
//             isSelf: true,
//             isLiked:false,
//             isLiking: false,
//             firstName: 'Omar',
//             lastName: 'Bednaoui',
//             userName: 'obednaou',
//             age: 23,
//             gender: 'male',
//             sexualPreferences: 'heterosexual',
//             profilePicture: 'https://cdn.intra.42.fr/users/c33a9dddabed7298d6a21bfacd7e5f76/obednaou.JPG',
//             biography: 'Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. let’s make memories together.',
//             fameRating: 4,
//         },
//         interests: ['science', 'history', 'travel'],
//         userPhotos: [],
//     },
//     {
//         userInfo: {
//             id: '2',
//             isSelf: false,
//             isLiked:true,
//             isLiking: false,
//             firstName: 'Oussama',
//             lastName: 'Khiar',
//             userName: 'okhiar',
//             age: 23,
//             gender: 'male',
//             sexualPreferences: 'heterosexual',
//             profilePicture: 'https://cdn.intra.42.fr/users/b752273cac16bd0fb1cf7195cde87d06/okhiar.JPG',
//             biography: 'Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. let’s make memories together.',
//             fameRating: 4,
//         },
//         interests: ['science', 'history', 'travel'],
//         userPhotos: [],
//     },
//     {
//         userInfo: {
//             id: '3',
//             isSelf: false,
//             isLiked: false,
//             isLiking: false,
//             firstName: 'Oyoub',
//             lastName: 'Ben Hamou',
//             userName: 'oben-ham',
//             age: 23,
//             gender: 'female',
//             sexualPreferences: 'lesbian',
//             profilePicture: 'https://cdn.intra.42.fr/users/b7eb31b25645d03918e9c54265ad7f9a/aben-ham.jpg',
//             biography: 'Hey there, I am using matcha. Looking for f****a to share sunsets and spontaneous road trips. let’s make memories together. I am working hard on post common core cursus to show her how smart and disciplined I am.',
//             fameRating: 2
//         },
//         interests: ['science', 'history', 'travel'],
//         userPhotos: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjNCQuPKwuASXizfHpDfreaYgQRFZLnkb6tA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjNCQuPKwuASXizfHpDfreaYgQRFZLnkb6tA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjNCQuPKwuASXizfHpDfreaYgQRFZLnkb6tA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjNCQuPKwuASXizfHpDfreaYgQRFZLnkb6tA&s'],
//     },
// ];

// export let dummyBriefProfileInfo: BriefProfileInfo[] = [
//     {
//         id: '1',
//         firstName: 'Omar',
//         lastName: 'Bednaoui',
//         userName: 'obednaou',
//         age: 23,
//         gender: 'male',
//         sexualPreferences: 'heterosexual',
//         profilePicture: 'https://cdn.intra.42.fr/users/c33a9dddabed7298d6a21bfacd7e5f76/obednaou.JPG',
//         biography: 'Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. let’s make memories together.',
//     },
//     {
//         id: '2',
//         firstName: 'Oussama',
//         lastName: 'Khiar',
//         userName: 'okhiar',
//         age: 23,
//         gender: 'male',
//         sexualPreferences: 'heterosexual',
//         profilePicture: 'https://cdn.intra.42.fr/users/b752273cac16bd0fb1cf7195cde87d06/okhiar.JPG',
//         biography: 'Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. let’s make memories together.',
//     },
//     {
//         id: '3',
//         firstName: 'Oyoub',
//         lastName: 'Ben Hamou',
//         userName: 'oben-ham',
//         age: 24,
//         gender: 'male',
//         sexualPreferences: 'lesbian',
//         profilePicture: 'https://cdn.intra.42.fr/users/b7eb31b25645d03918e9c54265ad7f9a/aben-ham.jpg',
//         biography: 'Hey there, I am using matcha. Looking for f****a to share sunsets and spontaneous road trips. let’s make memories together. I am working hard on post common core cursus to show her how smart and disciplined I am.',
//     },
// ];
