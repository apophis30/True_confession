import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(2,"Username atleast 2 character")
    .max(20, "Username atmost 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/,"Username must not contain special character")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid Email"}),
    password: z.string().min(6,{message: "Password must be at leat 6 characters"})
})