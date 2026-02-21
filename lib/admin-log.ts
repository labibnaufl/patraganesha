import { prisma } from "@/lib/prisma";

type LogAction =
  | "APPROVE"
  | "REJECT"
  | "BAN"
  | "UNBAN"
  | "ROLE_CHANGE"
  | "ARCHIVE"
  | "UNARCHIVE"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH";

type LogEntity = "User" | "Article" | "Event" | "AcademicInfo" | "Tag";

type CreateLogParams = {
  adminId: string;
  action: LogAction;
  entity: LogEntity;
  entityId?: string;
  details?: string;
};

/**
 * Write an entry to the AdminLog table.
 * Fire-and-forget — never throws, so it never breaks the calling action.
 */
export async function createAdminLog({
  adminId,
  action,
  entity,
  entityId,
  details,
}: CreateLogParams): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        userId: adminId,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (err) {
    // Log failure should never surface to the user
    console.error("[AdminLog] Failed to write log:", err);
  }
}
