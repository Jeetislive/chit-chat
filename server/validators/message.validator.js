import { z } from "zod";

export const sendMessageSchema = z.object({
    message: z.string().min(1, "Message cannot be empty").max(5000),
    replyTo: z.string().optional(),
});
