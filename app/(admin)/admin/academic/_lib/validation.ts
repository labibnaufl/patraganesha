import { z } from "zod";

export const academicSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  type: z.enum(["LOMBA", "BEASISWA", "INFO_KAMPUS"], {
    errorMap: () => ({ message: "Pilih jenis informasi akademik yang valid" }),
  }),
  coverImage: z.string().optional(),
  driveLink: z
    .string()
    .url("Link Drive tidak valid")
    .optional()
    .or(z.literal("")),
  externalLink: z
    .string()
    .url("Link eksternal tidak valid")
    .optional()
    .or(z.literal("")),

  deadline: z.string().min(1, "Tenggat waktu wajib diisi"),

  requirements: z.string().optional(),

  // Conditional fields
  prizes: z.string().optional(),
  benefits: z.string().optional(),

  // Tag IDs for relation
  tagIds: z.array(z.string()).default([]),

  contactPerson: z.string().optional(),
  contactEmail: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),
});

export type AcademicData = z.infer<typeof academicSchema>;
