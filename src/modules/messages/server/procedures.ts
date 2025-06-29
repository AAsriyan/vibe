import { MessageRole, MessageType } from "@/generated/prisma";
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const messages = await prisma.message.findMany({
      orderBy: {
        updatedAt: "asc",
      },
    });

    return messages;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required" }),
      })
    )
    .mutation(async ({ input }) => {
      const { value } = input;

      const createdMessage = await prisma.message.create({
        data: {
          content: value,
          role: MessageRole.USER,
          type: MessageType.RESULT,
        },
      });

      await inngest.send({
        name: "code-agent/run",
        data: {
          value: input.value,
        },
      });

      return createdMessage;
    }),
});
