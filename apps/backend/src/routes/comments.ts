import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Proposal } from "@prisma/client";
import { prisma } from "../db/client.js";
import { requireAuth, getAllowedCommentVisibilities } from "../middleware/auth.js";
import { auditLog } from "../services/auditLog.js";

// ── Visibility tiers (must match VISIBILITY_BY_ROLE in middleware/auth.ts) ───
// Confirmed mapping (2026-07-22):
//   Legacy "PUBLIC"   → "APPLICANT_VISIBLE"
//   Legacy "INTERNAL" → "FOCAL_AND_INTERNAL"
const COMMENT_VISIBILITIES = [
  "APPLICANT_VISIBLE",
  "FOCAL_AND_INTERNAL",
  "RTEC_PRIVATE",
  "RTEC_HEAD_ONLY",
  "OFFICIAL_WORKFLOW",
  "ADMIN_AUDIT_ONLY",
] as const;
type CommentVisibility = (typeof COMMENT_VISIBILITIES)[number];

// ── Access helper (same pattern as proposals.ts) ─────────────────────────────

async function canAccessProposal(
  proposalId: string,
  currentUserId: string,
  roles: string[],
): Promise<{ allowed: boolean; proposal: Proposal | null }> {
  // ADMIN and REGIONAL_DIRECTOR both get unconditional access — see
  // proposals.ts canAccessProposal for the full rationale (Roles-and-
  // Permissions §3.3 lists RD as "✅", not "Assigned", for comment actions).
  if (roles.includes("ADMIN") || roles.includes("REGIONAL_DIRECTOR")) {
    const proposal = await prisma.proposal.findUnique({ where: { id: proposalId } });
    return { allowed: true, proposal };
  }
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { assignments: { where: { userId: currentUserId, isActive: true } } },
  });
  if (!proposal) return { allowed: false, proposal: null };
  const isOwner = proposal.applicantUserId === currentUserId;
  const withAssignments = proposal as Proposal & {
    assignments: { userId: string; isActive: boolean }[];
  };
  const isAssigned = withAssignments.assignments.length > 0;
  return { allowed: isOwner || isAssigned, proposal };
}

// ── Zod schemas ──────────────────────────────────────────────────────────────

const idParamSchema = z.object({ id: z.string().uuid() });

const commentParamSchema = z.object({
  id: z.string().uuid(),
  commentId: z.string().uuid(),
});

// Roles-and-Permissions §3.3: "Resolve comment" / "Reopen comment" are
// Assigned for PROJECT_FOCAL, RTEC_HEAD, BUDGET_OFFICER, ACCOUNTANT
// (RTEC_MEMBER is ❌ despite being an assignable role). REGIONAL_DIRECTOR is
// unconditional ✅.
const RESOLVE_REOPEN_ROLES = ["PROJECT_FOCAL", "RTEC_HEAD", "BUDGET_OFFICER", "ACCOUNTANT"];

function canResolveOrReopen(
  currentUser: { id: string; roles: string[] },
  comment: { authorUserId: string },
  allowed: boolean,
): boolean {
  const isAuthor = comment.authorUserId === currentUser.id;
  const isAdmin = currentUser.roles.includes("ADMIN");
  const isRd = currentUser.roles.includes("REGIONAL_DIRECTOR");
  const hasAssignedResolveRole =
    allowed && currentUser.roles.some((r) => RESOLVE_REOPEN_ROLES.includes(r));
  return isAuthor || isAdmin || isRd || hasAssignedResolveRole;
}

const createCommentSchema = z.object({
  commentType: z.enum(["FIELD", "SECTION", "GENERAL"]),
  visibility: z.enum(COMMENT_VISIBILITIES),
  body: z.string().min(1),
  targetFieldId: z.string().uuid().optional(),
  targetSectionId: z.string().uuid().optional(),
});

// ── Route plugin ─────────────────────────────────────────────────────────────

export default async function commentsRoutes(fastify: FastifyInstance) {
  // POST /api/proposals/:id/comments — create a comment
  fastify.post(
    "/api/proposals/:id/comments",
    { preHandler: requireAuth() },
    async (request, reply) => {
      const currentUser = request.currentUser!;
      const params = idParamSchema.parse(request.params);

      const { allowed, proposal } = await canAccessProposal(
        params.id,
        currentUser.id,
        currentUser.roles,
      );

      if (!proposal) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }
      if (!allowed) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      const body = createCommentSchema.parse(request.body);

      // Validate FIELD comment requires targetFieldId
      if (body.commentType === "FIELD" && !body.targetFieldId) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "targetFieldId is required for FIELD comments",
        });
      }

      // Validate SECTION comment requires targetSectionId
      if (body.commentType === "SECTION" && !body.targetSectionId) {
        return reply.status(400).send({
          error: "Bad Request",
          message: "targetSectionId is required for SECTION comments",
        });
      }

      // Visibility rule: user can only create a comment with a visibility tier
      // they are allowed to read. Applicants are limited to APPLICANT_VISIBLE.
      const allowedVisibilities = getAllowedCommentVisibilities(currentUser.roles);
      if (!allowedVisibilities.includes(body.visibility as CommentVisibility)) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      if (!proposal.currentVersionId) {
        return reply.status(400).send({ error: "Bad Request", message: "No current version" });
      }

      const comment = await prisma.proposalComment.create({
        data: {
          proposalId: proposal.id,
          proposalVersionId: proposal.currentVersionId,
          authorUserId: currentUser.id,
          commentType: body.commentType,
          visibility: body.visibility,
          body: body.body,
          targetFieldId: body.targetFieldId ?? null,
          targetSectionId: body.targetSectionId ?? null,
          isResolved: false,
        },
      });

      await auditLog(prisma, {
        actorUserId: currentUser.id,
        actorRole: currentUser.roles[0] ?? null,
        action: "COMMENT_ADDED",
        entityType: "proposal_comments",
        entityId: comment.id,
        ipAddress: request.ip ?? null,
      });

      return reply.status(201).send({
        id: comment.id,
        commentType: comment.commentType,
        visibility: comment.visibility,
        body: comment.body,
        createdAt: comment.createdAt,
      });
    },
  );

  // GET /api/proposals/:id/comments — list comments
  fastify.get(
    "/api/proposals/:id/comments",
    { preHandler: requireAuth() },
    async (request, reply) => {
      const currentUser = request.currentUser!;
      const params = idParamSchema.parse(request.params);

      const { allowed, proposal } = await canAccessProposal(
        params.id,
        currentUser.id,
        currentUser.roles,
      );

      if (!proposal) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }
      if (!allowed) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      // Filter to visibilities the current user is allowed to see.
      const allowedVisibilities = getAllowedCommentVisibilities(currentUser.roles);

      const comments = await prisma.proposalComment.findMany({
        where: {
          proposalId: params.id,
          visibility: { in: allowedVisibilities },
        },
        orderBy: { createdAt: "asc" },
      });

      return reply.status(200).send(
        comments.map((c) => ({
          id: c.id,
          commentType: c.commentType,
          visibility: c.visibility,
          body: c.body,
          authorUserId: c.authorUserId,
          isResolved: c.isResolved,
          createdAt: c.createdAt,
        })),
      );
    },
  );

  // PATCH /api/proposals/:id/comments/:commentId/resolve
  fastify.patch(
    "/api/proposals/:id/comments/:commentId/resolve",
    { preHandler: requireAuth() },
    async (request, reply) => {
      const currentUser = request.currentUser!;
      const params = commentParamSchema.parse(request.params);

      const { allowed, proposal } = await canAccessProposal(
        params.id,
        currentUser.id,
        currentUser.roles,
      );

      if (!proposal) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }
      if (!allowed) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      const comment = await prisma.proposalComment.findFirst({
        where: { id: params.commentId, proposalId: params.id },
      });

      if (!comment) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }

      if (!canResolveOrReopen(currentUser, comment, allowed)) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      const now = new Date();
      const updated = await prisma.proposalComment.update({
        where: { id: comment.id },
        data: { isResolved: true, resolvedBy: currentUser.id, resolvedAt: now },
      });

      await auditLog(prisma, {
        actorUserId: currentUser.id,
        actorRole: currentUser.roles[0] ?? null,
        action: "COMMENT_RESOLVED",
        entityType: "proposal_comments",
        entityId: comment.id,
        ipAddress: request.ip ?? null,
      });

      return reply.status(200).send({
        id: updated.id,
        isResolved: updated.isResolved,
        resolvedAt: updated.resolvedAt,
      });
    },
  );

  // PATCH /api/proposals/:id/comments/:commentId/reopen
  fastify.patch(
    "/api/proposals/:id/comments/:commentId/reopen",
    { preHandler: requireAuth() },
    async (request, reply) => {
      const currentUser = request.currentUser!;
      const params = commentParamSchema.parse(request.params);

      const { allowed, proposal } = await canAccessProposal(
        params.id,
        currentUser.id,
        currentUser.roles,
      );

      if (!proposal) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }
      if (!allowed) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      const comment = await prisma.proposalComment.findFirst({
        where: { id: params.commentId, proposalId: params.id },
      });

      if (!comment) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }

      if (!canResolveOrReopen(currentUser, comment, allowed)) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      const updated = await prisma.proposalComment.update({
        where: { id: comment.id },
        data: { isResolved: false, resolvedBy: null, resolvedAt: null },
      });

      await auditLog(prisma, {
        actorUserId: currentUser.id,
        actorRole: currentUser.roles[0] ?? null,
        action: "COMMENT_REOPENED",
        entityType: "proposal_comments",
        entityId: comment.id,
        ipAddress: request.ip ?? null,
      });

      return reply.status(200).send({
        id: updated.id,
        isResolved: updated.isResolved,
      });
    },
  );
}
