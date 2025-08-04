"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.updatePasswordSchema = exports.resetPasswordSchema = exports.verificationEmailSchema = exports.loginSchema = exports.companyRegisterSchema = exports.registerSchema = exports.verificationCodeSchema = exports.passwordSchema = exports.userNameSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.string().trim().email().min(1).max(255);
exports.userNameSchema = zod_1.z.string().trim().min(1).max(50);
exports.passwordSchema = zod_1.z
    .string()
    .trim()
    .min(6)
    .max(255)
    .regex(/[A-Z]/, {
    message: 'Password harus mengandung minimal 1 huruf kapital',
})
    .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' });
exports.verificationCodeSchema = zod_1.z.string().trim().min(1).max(25);
exports.registerSchema = zod_1.z
    .object({
    fullname: zod_1.z.string().trim().min(1).max(255),
    username: exports.userNameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    confirmPassword: exports.passwordSchema,
})
    .refine((value) => value.password === value.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword'],
});
exports.companyRegisterSchema = zod_1.z
    .object({
    fullname: zod_1.z.string().trim().min(1).max(255),
    companyName: zod_1.z.string().trim().min(1).max(255),
    username: exports.userNameSchema,
    email: exports.emailSchema,
    password: exports.passwordSchema,
    confirmPassword: exports.passwordSchema,
})
    .refine((value) => value.password === value.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword'],
});
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().trim().min(1).max(50).or(exports.emailSchema),
    password: exports.passwordSchema,
    userAgent: zod_1.z.string().trim().optional(),
    code: zod_1.z.string().optional(),
});
exports.verificationEmailSchema = zod_1.z.object({
    code: exports.verificationCodeSchema,
});
exports.resetPasswordSchema = zod_1.z.object({
    password: exports.passwordSchema,
    verificationCode: exports.verificationCodeSchema,
});
exports.updatePasswordSchema = zod_1.z
    .object({
    oldPassword: exports.passwordSchema,
    password: exports.passwordSchema,
    confirmPassword: exports.passwordSchema,
})
    .refine((value) => value.password === value.confirmPassword, {
    message: 'Password does not match',
    path: ['confirmPassword'],
});
exports.updateProfileSchema = zod_1.z.object({
    fullname: zod_1.z.string().trim().min(1).max(255).optional(),
    profilePicture: zod_1.z.string(),
});
