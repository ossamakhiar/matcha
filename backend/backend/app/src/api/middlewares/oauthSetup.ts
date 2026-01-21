import { PassportStatic } from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { findOrCreateUser } from '../services/oauth.js';

export function setupOauth(passport: PassportStatic) {
    passport.use(new DiscordStrategy({
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: process.env.DISCORD_CALLBACK_URL!,
        scope: ['identify', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const userId = await findOrCreateUser(profile);

            // console.log('oauthUserId' + userId);
            return done(null, userId);
        } catch (err) {
            return done(err, false);
        }
    }));
}
