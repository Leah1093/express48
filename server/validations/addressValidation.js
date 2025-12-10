// validation/addressValidation.js
import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),

  country: z.string().min(2).default("IL"),
  city: z.string().min(2),
  street: z.string().min(2),

  houseNumber: z.string().optional(),
  apartment: z.string().optional(),

  // ✅ נקבל גם zip וגם zipCode
  zip: z.string().optional(),
  zipCode: z.string().optional(),

  isDefault: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateAddressSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),

  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  street: z.string().min(2).optional(),

  houseNumber: z.string().optional(),
  apartment: z.string().optional(),
  zip: z.string().optional(),
  zipCode: z.string().optional(),

  isDefault: z.boolean().optional(),
  notes: z.string().optional(),
});
