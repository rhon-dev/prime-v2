import Fastify, { type FastifyError } from "fastify";
import fastifyEnv from "@fastify/env";
import fastifyHelmet from "@fastify/helmet";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyOauth2 from "@fastify/oauth2";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyMultipart from "@fastify/multipart";
import ConnectPgSimple from "connect-pg-simple";
import pg from "pg";
import { envPluginOptions } from "./plugins/env.js";
import healthRoutes from "./routes/health.js";
import authRoutes, { SESSION_COOKIE_NAME } from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import proposalTypesRoutes from "./routes/proposalTypes.js";
import formTemplatesRoutes from "./routes/formTemplates.js";
import proposalsRoutes from "./routes/proposals.js";
import attachmentsRoutes from "./routes/attachments.js";
import submissionRoutes from "./routes/submission.js";
import commentsRoutes from "./routes/comments.js";
import versionsRoutes from "./routes/versions.js";
import workflowRoutes from "./routes/workflow.js";
import assignmentsRoutes from "./routes/assignments.js";
import rtecRoutes from "./routes/rtec.js";
import adminRtecGroupsRoutes from "./routes/adminRtecGroups.js";
import budgetRoutes from "./routes/budget.js";
import accountingRoutes from "./routes/accounting.js";
import rdRoutes from "./routes/rd.js";
import exportRoutes from "./routes/export.js";
import notificationsRoutes from "./routes/notifications.js";
import rolesRoutes from "./routes/roles.js";
import queuesRoutes from "./routes/queues.js";
import auditLogsRoutes from "./routes/auditLogs.js";
import adminRoutes from "./routes/admin.js";
import { logger, setLogLevel } from "./utils/logger.js";

const SESSION_SLIDING_MAX_AGE_MS = 30 * 60 * 1000;

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  // 1. Env validation first — app must crash before any other plugin
  //    registers if a required var is missing or invalid.
  await app.register(fastifyEnv, envPluginOptions);
  setLogLevel(app.config.NODE_ENV === "development" ? "debug" : "info");

  // 1b. Dev-account safety check (production only).
  //     If any user with a @dev.local email exists while NODE_ENV=production,
  //     the seed script was run against a real database. Refuse to boot rather
  //     than silently serve a system that may have working dev credentials.
  if (app.config.NODE_ENV === "production") {
    const { prisma } = await import("./db/client.js");
    const devAccountCount = await prisma.user.count({
      where: { email: { endsWith: "@dev.local" } },
    });
    if (devAccountCount > 0) {
      app.log.fatal(
        { devAccountCount },
        "FATAL: dev test accounts (@dev.local) found in a production database. " +
        "The seed script must not be run against production. " +
        "Remove these accounts before restarting.",
      );
      process.exit(1);
    }
  }

  // 2. Security headers before any routes.
  await app.register(fastifyHelmet);

  // 3. CORS scoped to FRONTEND_URL only — never a wildcard.
  await app.register(fastifyCors, {
    origin: app.config.FRONTEND_URL,
    credentials: true,
  });

  // 4. Cookies + server-side session (PostgreSQL-backed via connect-pg-simple —
  //    NOT JWT, so a deactivation can invalidate sessions immediately).
  await app.register(fastifyCookie);

  const sessionPgPool = new pg.Pool({ connectionString: app.config.DATABASE_URL });
  const PgSessionStore = ConnectPgSimple(fastifySession as never);
  await app.register(fastifySession, {
    secret: app.config.SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    store: new PgSessionStore({
      pool: sessionPgPool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    cookie: {
      httpOnly: true,
      secure: app.config.NODE_ENV !== "development",
      sameSite: app.config.NODE_ENV === "development" ? "lax" : "strict",
      maxAge: SESSION_SLIDING_MAX_AGE_MS,
    },
    saveUninitialized: false,
  });
  app.addHook("onClose", async () => {
    await sessionPgPool.end();
  });

  // 5. Google OAuth2 client for the Applicant login path only.
  await app.register(fastifyOauth2, {
    name: "oauth2Google",
    scope: ["openid", "email", "profile"],
    credentials: {
      client: {
        id: app.config.GOOGLE_CLIENT_ID,
        secret: app.config.GOOGLE_CLIENT_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    callbackUri: app.config.GOOGLE_CALLBACK_URL,
  });

  // 6. Global rate limiting (defense in depth). The staff login endpoint also
  //    enforces its own PostgreSQL-backed per-IP/per-email limits in
  //    services/rateLimit.ts so the state survives a process restart.
  await app.register(fastifyRateLimit, {
    global: false,
  });

  // 6b. Multipart file upload support. fileSize is capped at 60 MB — comfortably
  //     above the 50 MB application-level limit in attachments.ts (so the normal
  //     oversized-file case still reaches the handler and gets a clean 400) but
  //     finite, so @fastify/multipart aborts the stream instead of buffering an
  //     unbounded body into memory (Phase 14 security review: Infinity here was
  //     a memory-exhaustion DoS vector for authenticated uploads).
  await app.register(fastifyMultipart, { limits: { fileSize: 60 * 1024 * 1024 } });

  // 7. Routes
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(proposalTypesRoutes);
  await app.register(formTemplatesRoutes);
  await app.register(proposalsRoutes);
  await app.register(attachmentsRoutes);
  await app.register(submissionRoutes);
  await app.register(commentsRoutes);
  await app.register(versionsRoutes);
  await app.register(workflowRoutes);
  await app.register(assignmentsRoutes);
  await app.register(rtecRoutes);
  await app.register(adminRtecGroupsRoutes);
  await app.register(budgetRoutes);
  await app.register(accountingRoutes);
  await app.register(rdRoutes);
  await app.register(exportRoutes);
  await app.register(notificationsRoutes);
  await app.register(rolesRoutes);
  await app.register(queuesRoutes);
  await app.register(auditLogsRoutes);
  await app.register(adminRoutes);

  // 8. Error handlers
  app.setErrorHandler<FastifyError>((error, _request, reply) => {
    app.log.error(error);
    if (error.validation || error.name === "ZodError") {
      return reply.status(400).send({ error: "Bad Request", statusCode: 400 });
    }
    reply.status(500).send({
      error: "Internal Server Error",
      statusCode: 500,
      ...(app.config.NODE_ENV === "development" ? { stack: error.stack } : {}),
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: "Not Found",
      statusCode: 404,
    });
  });

  return app;
}
