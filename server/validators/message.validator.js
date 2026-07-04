import { z } from "zod";

export const sendMessageSchema = z.object({
    content: z.string().trim().min(1, "Content cannot be empty").max(10000),
    replyTo: z.string().trim().optional(),
    encrypted: z.boolean().optional(),
    nonce: z.string().trim().optional(),
});
