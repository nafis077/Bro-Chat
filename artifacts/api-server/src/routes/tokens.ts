import { Router } from "express";
import { eq, sql, ilike, and } from "drizzle-orm";
import { db, fbTokensTable } from "@workspace/db";
import {
  ListTokensQueryParams,
  CreateTokenBody,
  UpdateTokenBody,
  GetTokenParams,
  UpdateTokenParams,
  DeleteTokenParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tokens", async (req, res) => {
  const query = ListTokensQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { status, search } = query.data;

  const conditions = [];
  if (status) {
    conditions.push(eq(fbTokensTable.status, status as "active" | "expired" | "invalid"));
  }
  if (search) {
    conditions.push(ilike(fbTokensTable.fbId, `%${search}%`));
  }

  const tokens = await db
    .select()
    .from(fbTokensTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(fbTokensTable.createdAt);

  const mapped = tokens.map((t) => ({
    id: t.id,
    fbId: t.fbId,
    token: t.token,
    status: t.status,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  res.json(mapped);
});

router.post("/tokens", async (req, res) => {
  const body = CreateTokenBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.issues });
    return;
  }

  const [created] = await db
    .insert(fbTokensTable)
    .values({
      fbId: body.data.fbId,
      token: body.data.token,
      status: body.data.status as "active" | "expired" | "invalid",
      note: body.data.note ?? null,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    fbId: created.fbId,
    token: created.token,
    status: created.status,
    note: created.note,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  });
});

router.get("/tokens/stats", async (req, res) => {
  const rows = await db
    .select({
      status: fbTokensTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(fbTokensTable)
    .groupBy(fbTokensTable.status);

  const stats = { total: 0, active: 0, expired: 0, invalid: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }

  res.json(stats);
});

router.get("/tokens/:id", async (req, res) => {
  const params = GetTokenParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [token] = await db
    .select()
    .from(fbTokensTable)
    .where(eq(fbTokensTable.id, params.data.id));

  if (!token) {
    res.status(404).json({ error: "Token not found" });
    return;
  }

  res.json({
    id: token.id,
    fbId: token.fbId,
    token: token.token,
    status: token.status,
    note: token.note,
    createdAt: token.createdAt.toISOString(),
    updatedAt: token.updatedAt.toISOString(),
  });
});

router.put("/tokens/:id", async (req, res) => {
  const params = UpdateTokenParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = UpdateTokenBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body", details: body.error.issues });
    return;
  }

  const updateData: Partial<typeof fbTokensTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (body.data.fbId !== undefined) updateData.fbId = body.data.fbId;
  if (body.data.token !== undefined) updateData.token = body.data.token;
  if (body.data.status !== undefined) updateData.status = body.data.status as "active" | "expired" | "invalid";
  if (body.data.note !== undefined) updateData.note = body.data.note;

  const [updated] = await db
    .update(fbTokensTable)
    .set(updateData)
    .where(eq(fbTokensTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Token not found" });
    return;
  }

  res.json({
    id: updated.id,
    fbId: updated.fbId,
    token: updated.token,
    status: updated.status,
    note: updated.note,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.delete("/tokens/:id", async (req, res) => {
  const params = DeleteTokenParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(fbTokensTable).where(eq(fbTokensTable.id, params.data.id));
  res.status(204).send();
});

export default router;
