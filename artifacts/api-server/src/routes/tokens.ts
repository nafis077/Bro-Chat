import { Router } from "express";
import { eq, sql, ilike, and, inArray } from "drizzle-orm";
import { db, fbTokensTable } from "@workspace/db";
import { z } from "zod";
import {
  ListTokensQueryParams,
  CreateTokenBody,
  UpdateTokenBody,
  GetTokenParams,
  UpdateTokenParams,
  DeleteTokenParams,
} from "@workspace/api-zod";

const router = Router();

const BulkStatusBody = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  status: z.enum(["active", "expired", "invalid"]),
});

const BulkDeleteBody = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

// ── List ──────────────────────────────────────────────────────────────────────
router.get("/tokens", async (req, res) => {
  const query = ListTokensQueryParams.safeParse(req.query);
  if (!query.success) { res.status(400).json({ error: "Invalid query params" }); return; }

  const { status, search } = query.data;
  const conditions = [];
  if (status) conditions.push(eq(fbTokensTable.status, status as "active" | "expired" | "invalid"));
  if (search) conditions.push(ilike(fbTokensTable.fbId, `%${search}%`));

  const tokens = await db
    .select()
    .from(fbTokensTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(fbTokensTable.createdAt);

  res.json(tokens.map((t) => ({
    id: t.id, fbId: t.fbId, token: t.token, cookie: t.cookie,
    status: t.status, note: t.note,
    createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString(),
  })));
});

// ── Create ────────────────────────────────────────────────────────────────────
router.post("/tokens", async (req, res) => {
  const body = CreateTokenBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body", details: body.error.issues }); return; }

  const [created] = await db.insert(fbTokensTable).values({
    fbId: body.data.fbId, token: body.data.token,
    cookie: body.data.cookie ?? null,
    status: body.data.status as "active" | "expired" | "invalid",
    note: body.data.note ?? null,
  }).returning();

  res.status(201).json({
    id: created.id, fbId: created.fbId, token: created.token, cookie: created.cookie,
    status: created.status, note: created.note,
    createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString(),
  });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/tokens/stats", async (req, res) => {
  const rows = await db
    .select({ status: fbTokensTable.status, count: sql<number>`count(*)::int` })
    .from(fbTokensTable)
    .groupBy(fbTokensTable.status);

  const stats = { total: 0, active: 0, expired: 0, invalid: 0 };
  for (const row of rows) { stats[row.status] = row.count; stats.total += row.count; }
  res.json(stats);
});

// ── Bulk status update ────────────────────────────────────────────────────────
router.patch("/tokens/bulk-status", async (req, res) => {
  const body = BulkStatusBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body", details: body.error.issues }); return; }

  const { ids, status } = body.data;
  await db
    .update(fbTokensTable)
    .set({ status: status as "active" | "expired" | "invalid", updatedAt: new Date() })
    .where(inArray(fbTokensTable.id, ids));

  res.json({ updated: ids.length });
});

// ── Bulk delete ───────────────────────────────────────────────────────────────
router.delete("/tokens/bulk", async (req, res) => {
  const body = BulkDeleteBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body", details: body.error.issues }); return; }

  await db.delete(fbTokensTable).where(inArray(fbTokensTable.id, body.data.ids));
  res.status(204).send();
});

// ── Delete all ────────────────────────────────────────────────────────────────
router.delete("/tokens", async (req, res) => {
  await db.delete(fbTokensTable);
  res.status(204).send();
});

// ── Get one ───────────────────────────────────────────────────────────────────
router.get("/tokens/:id", async (req, res) => {
  const params = GetTokenParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [token] = await db.select().from(fbTokensTable).where(eq(fbTokensTable.id, params.data.id));
  if (!token) { res.status(404).json({ error: "Token not found" }); return; }

  res.json({
    id: token.id, fbId: token.fbId, token: token.token, cookie: token.cookie,
    status: token.status, note: token.note,
    createdAt: token.createdAt.toISOString(), updatedAt: token.updatedAt.toISOString(),
  });
});

// ── Update one ────────────────────────────────────────────────────────────────
router.put("/tokens/:id", async (req, res) => {
  const params = UpdateTokenParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const body = UpdateTokenBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid body", details: body.error.issues }); return; }

  const updateData: Partial<typeof fbTokensTable.$inferInsert> = { updatedAt: new Date() };
  if (body.data.fbId !== undefined) updateData.fbId = body.data.fbId;
  if (body.data.token !== undefined) updateData.token = body.data.token;
  if (body.data.cookie !== undefined) updateData.cookie = body.data.cookie;
  if (body.data.status !== undefined) updateData.status = body.data.status as "active" | "expired" | "invalid";
  if (body.data.note !== undefined) updateData.note = body.data.note;

  const [updated] = await db.update(fbTokensTable).set(updateData).where(eq(fbTokensTable.id, params.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Token not found" }); return; }

  res.json({
    id: updated.id, fbId: updated.fbId, token: updated.token, cookie: updated.cookie,
    status: updated.status, note: updated.note,
    createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
  });
});

// ── Delete one ────────────────────────────────────────────────────────────────
router.delete("/tokens/:id", async (req, res) => {
  const params = DeleteTokenParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(fbTokensTable).where(eq(fbTokensTable.id, params.data.id));
  res.status(204).send();
});

export default router;
