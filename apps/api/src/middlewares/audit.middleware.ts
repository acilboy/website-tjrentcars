import { prisma } from "../lib/prisma.js";

export async function recordAuditLog(params: {
  adminId?: string;
  adminEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId || null,
        adminEmail: params.adminEmail || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
