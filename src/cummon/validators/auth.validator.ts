import { z } from 'zod';

export const emailSchema = z.string().trim().email().min(1).max(255);
export const userNameSchema = z.string().trim().min(1).max(50);
export const passwordSchema = z
  .string()
  .trim()
  .min(6)
  .max(255)
  .regex(/[A-Z]/, {
    message: 'Password harus mengandung minimal 1 huruf kapital',
  })
  .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' });
export const verificationCodeSchema = z.string().trim().min(1).max(25);

export const registerSchema = z
  .object({
    fullname: z.string().trim().min(1).max(255),
    username: userNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(50).or(emailSchema),
  password: passwordSchema,
  userAgent: z.string().trim().optional(),
});

export const verificationEmailSchema = z.object({
  code: verificationCodeSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});

export const updatePasswordSchema = z
  .object({
    oldPassword: passwordSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  fullname: z.string().trim().min(1).max(255).optional(),
  profilePicture: z.string(),
});
