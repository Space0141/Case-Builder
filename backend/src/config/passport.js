import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { config } from "./env.js";
import { asObjectId, getDb, toPublic } from "../db.js";

async function fetchGuildRoles(discordUserId) {
  if (!config.discord.guildId || !process.env.DISCORD_BOT_TOKEN) {
    return [];
  }

  const memberResp = await fetch(
    `https://discord.com/api/v10/guilds/${config.discord.guildId}/members/${discordUserId}`,
    {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    }
  );

  if (!memberResp.ok) return [];
  const member = await memberResp.json();
  const roleIds = member.roles || [];
  if (!roleIds.length) return [];

  const rolesResp = await fetch(
    `https://discord.com/api/v10/guilds/${config.discord.guildId}/roles`,
    {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    }
  );

  if (!rolesResp.ok) return [];
  const roles = await rolesResp.json();
  return roles.filter((r) => roleIds.includes(r.id)).map((r) => r.name);
}

function inferSystemRole(discordRoles) {
  const normalized = discordRoles.map((r) => r.toLowerCase());
  if (normalized.some((r) => r.includes("admin"))) return "Admin";
  if (normalized.some((r) => r.includes("supervisor"))) return "Supervisor";
  return "Officer";
}

export function configurePassport() {
  if (!config.discord.clientID || !config.discord.clientSecret || !config.discord.callbackURL) {
    return;
  }

  passport.use(
    new DiscordStrategy(
      {
        clientID: config.discord.clientID,
        clientSecret: config.discord.clientSecret,
        callbackURL: config.discord.callbackURL,
        scope: ["identify", "email"]
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const db = await getDb();
          const users = db.collection("users");
          const discordRoles = await fetchGuildRoles(profile.id);
          const mappedRole = inferSystemRole(discordRoles);
          const avatarUrl = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null;

          await users.updateOne(
            { discord_id: profile.id },
            {
              $set: {
                username: profile.username,
                avatar: avatarUrl,
                discord_roles: discordRoles,
                updated_at: new Date()
              },
              $setOnInsert: {
                role: mappedRole,
                created_at: new Date()
              }
            },
            { upsert: true }
          );

          const user = await users.findOne({ discord_id: profile.id });
          return done(null, toPublic(user));
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = await getDb();
      const user = await db.collection("users").findOne({ _id: asObjectId(id) });
      done(null, toPublic(user));
    } catch (error) {
      done(error, null);
    }
  });
}
