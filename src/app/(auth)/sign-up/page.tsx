'use client';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts'
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, {AxiosError} from 'axios'
import { ApiResponse } from "@/types/ApiResponse";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const page = () => {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setisSubmitting] = useState(false);
    const debounced = useDebounceCallback(setUsername, 500);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if(username){
                setIsCheckingUsername(true);
                setUsernameMessage('');
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`);
                    setUsernameMessage(response.data.message);
                } catch (err) {
                    const axiosError = err as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error Checking Username"
                    )
                } finally{
                    setIsCheckingUsername(false);
                }
            }
        }
        checkUsernameUnique();
    },[username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setisSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data);
            toast({
                title: 'Success',
                description: response.data.message
            })
            router.replace(`/verify/${username}`);
            setisSubmitting(false);
        } catch (err) {
            console.error("Error in SignUp of User", err);
            const axiosError = err as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message ?? "Error in SignUp"
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive"
            })
            setisSubmitting(false);
        }
    };

    return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Confession
                </h1>
                <p className="mb-4">Sign up to continue your secret conversations</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="username" 
                                {...field}
                                onChange={(e) => {
                                    field.onChange(e)
                                    debounced(e.target.value)
                                }}
                                />
                            </FormControl>
                            {isCheckingUsername && <Loader2 className="animate-spin" />}
                            <p className={`text-sm ${usernameMessage === "Username is available" ? 'text-green-500':'text-red-500'}`}>
                                {usernameMessage}
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="email" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="password" {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {
                        isSubmitting ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                            </>
                        ) : ('SignUp')
                    }
                </Button>
                </form>
            </Form>
            <div className="text-center mt-4">
                <p>
                    Not a member yet?{' '}
                    <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
}

export default page;