import z from 'zod';

export const signupSchema = z.object({
    email: z.string().trim().email('Invalid email'),
    password: z.string().trim().nonempty('Password is required'),
});

export const loginSchema = signupSchema;
