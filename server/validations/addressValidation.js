import { z } from "zod";

export const createAddressSchema = z.object({
    country: z.string().min(2),
    city: z.string().min(2),
    street: z.string().min(2),
    zip: z.string().optional(),
    isDefault: z.boolean().optional(),
     notes: z.string().optional() 
});

export const updateAddressSchema = z.object({
    country: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    street: z.string().min(2).optional(),
    zip: z.string().optional(),
    isDefault: z.boolean().optional(),
     notes: z.string().optional()
});
