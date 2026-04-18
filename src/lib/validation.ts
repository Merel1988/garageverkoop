import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Vul je naam in (minimaal 2 tekens)."),
  email: z.string().trim().toLowerCase().email("Vul een geldig e-mailadres in."),
  street: z.string().trim().min(2, "Vul je straatnaam in."),
  houseNumber: z
    .string()
    .trim()
    .min(1, "Vul je huisnummer in.")
    .max(10, "Huisnummer lijkt te lang."),
  phone: z
    .string()
    .trim()
    .max(20, "Telefoonnummer lijkt te lang.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  consent: z
    .union([z.boolean(), z.literal("on"), z.literal("true")])
    .refine((v) => v === true || v === "on" || v === "true", {
      message: "Je moet akkoord gaan om je aan te melden.",
    }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
