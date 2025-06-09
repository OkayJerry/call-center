import { z } from 'zod';

// This schema defines the validation rules for the signup endpoint.
// - email must be a valid email string.
// - password must meet complexity requirements.
export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    // Use .regex() to ensure the password contains the required characters.
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).*$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
});
