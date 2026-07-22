import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";
import { requireAuth } from "../middleware/auth.js";
import {
  isQueueKey,
  QUEUE_DEFINITIONS,
  type QueueKey,
} from "../services/queueConfig.js";

function serializeQueueProposal(p: {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  proposalType: { name: string };
}) {
  return {
    id: p.id,
    title: p.title,
    status: p.status,
    proposalType: { name: p.proposalType.name },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export default async function queuesRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/api/queues/:queueKey",
    { preHandler: requireAuth() },
    async (request, reply) => {
      const currentUser = request.currentUser!;
      const params = z.object({ queueKey: z.string() }).parse(request.params);

      if (!isQueueKey(params.queueKey)) {
        return reply.status(404).send({ error: "Not Found", statusCode: 404 });
      }

      const queueKey = params.queueKey as QueueKey;
      const definition = QUEUE_DEFINITIONS[queueKey];

      const hasAccess = definition.allowedRoles.some((role) =>
        currentUser.roles.includes(role),
      );
      if (!hasAccess) {
        return reply.status(403).send({ error: "Forbidden", statusCode: 403 });
      }

      const isAdmin = currentUser.roles.includes("ADMIN");
      const where: Prisma.ProposalWhereInput = {
        status: { in: definition.statuses },
      };

      if (!isAdmin && definition.assignmentRoleCode) {
        where.assignments = {
          some: {
            userId: currentUser.id,
            roleCode: definition.assignmentRoleCode,
            isActive: true,
          },
        };
      }

      const paginationQuery = z
        .object({
          limit: z.coerce.number().int().min(1).max(100).optional().default(50),
          offset: z.coerce.number().int().min(0).optional().default(0),
        })
        .parse(request.query);

      const [proposals, total] = await Promise.all([
        prisma.proposal.findMany({
          where,
          include: { proposalType: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
          take: paginationQuery.limit,
          skip: paginationQuery.offset,
        }),
        prisma.proposal.count({ where }),
      ]);

      return reply.status(200).send({
        queueKey,
        label: definition.label,
        total,
        limit: paginationQuery.limit,
        offset: paginationQuery.offset,
        proposals: proposals.map(serializeQueueProposal),
      });
    },
  );
}
