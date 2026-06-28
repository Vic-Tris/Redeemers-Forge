import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCheckoutBody } from "@workspace/api-zod";
import { getAuth } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    description: "Full access to all premium content, renewed monthly.",
    price: 9.99,
    interval: "month",
    features: [
      "Unlimited premium stories & devotionals",
      "Exclusive sermons & teaching series",
      "Full book library access",
      "Ad-free reading experience",
      "Priority support",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "Best value — full access for an entire year at a discounted rate.",
    price: 79.99,
    interval: "year",
    features: [
      "Everything in Monthly",
      "Save over 33% vs monthly",
      "Early access to new content",
      "Community badge & recognition",
      "Downloadable content for offline reading",
    ],
  },
];

// GET /subscriptions/plans
router.get("/plans", (_req, res: Response) => {
  res.json(PLANS);
});

// GET /subscriptions/my
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  const userId = getAuth(req).userId!;

  const [sub] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
  if (!sub) {
    res.json({ isPremium: false, plan: null, status: "inactive", renewsAt: null, cancelledAt: null });
    return;
  }

  res.json({
    isPremium: sub.isPremium,
    plan: sub.plan,
    status: sub.status,
    renewsAt: sub.renewsAt?.toISOString() ?? null,
    cancelledAt: sub.cancelledAt?.toISOString() ?? null,
  });
});

// POST /subscriptions/checkout
router.post("/checkout", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

  // Without Stripe configured, return a placeholder checkout URL
  const plan = PLANS.find((p) => p.id === parsed.data.planId);
  if (!plan) { res.status(400).json({ error: "Invalid plan" }); return; }

  res.json({ url: `/premium?plan=${plan.id}&checkout=pending` });
});

export default router;
