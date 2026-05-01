import { z } from "zod";

// ── Auth ────────────────────────────────────────────────────────────────────

export const ownerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const memberLoginSchema = z.object({
  phone: z.string().min(10).max(15),
  pin: z.string().length(4).regex(/^\d{4}$/),
});

// ── Member ──────────────────────────────────────────────────────────────────

export const createMemberSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal("")),
  planId: z.string().cuid().optional(),
  startDate: z.string().datetime().or(z.string().date()),
  endDate: z.string().datetime().or(z.string().date()),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  pin: z.string().length(4).regex(/^\d{4}$/),
});

export const updateMemberSchema = createMemberSchema.partial().omit({ pin: true }).extend({
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  isActive: z.boolean().optional(),
});

// ── Plan ────────────────────────────────────────────────────────────────────

export const createPlanSchema = z.object({
  name: z.string().min(2).max(100),
  durationDays: z.number().int().positive(),
  price: z.number().positive(),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

// ── Payment ─────────────────────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  memberId: z.string().cuid(),
  planId: z.string().cuid().optional(),
  amount: z.number().positive(),
  method: z.enum(["cash", "upi", "card"]).default("cash"),
  paidAt: z.string().datetime().optional(),
  notes: z.string().max(300).optional(),
});

// ── Renew ───────────────────────────────────────────────────────────────────

export const renewSchema = z.object({
  planId: z.string().cuid(),
  amount: z.number().positive(),
  method: z.enum(["cash", "upi", "card"]).default("cash"),
  startDate: z.string().datetime().or(z.string().date()).optional(),
});

// ── Gym ─────────────────────────────────────────────────────────────────────

export const updateGymSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  tagline: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  ownerName: z.string().min(2).max(100).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// ── Announcement ────────────────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(2).max(1000),
});
