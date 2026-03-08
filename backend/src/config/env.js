import dotenv from "dotenv";

dotenv.config();

const googleEnabled = process.env.ENABLE_GOOGLE_EXPORT === "true";

export const config = {
  port: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  sessionSecret: process.env.SESSION_SECRET || "dev-secret",
  mongodbUri: process.env.MONGODB_URI || process.env.DATABASE_URL,
  mongodbDbName: process.env.MONGODB_DB_NAME || "case_builder",
  googleEnabled,
  discord: {
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    guildId: process.env.DISCORD_GUILD_ID
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  }
};
