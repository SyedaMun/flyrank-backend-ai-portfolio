const { z } = require("zod");

const ticketClassifySchema = z.object({
  text: z
    .string({
      required_error: "Ticket string payload text is explicitly required.",
      invalid_type_error: "Inbound ticket request must be a valid text string.",
    })
    .min(1, { message: "Support ticket body cannot be submitted empty." })
    .max(2000, { message: "Support ticket size limits exceeded. Max capacity is 2000 characters." }),
});

module.exports = { ticketClassifySchema };
