'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LockIcon, MailIcon } from 'lucide-react';
import { httpClient } from '@/lib/httpClient';
import xior, { XiorError } from 'xior';
import { useRouter } from 'next/navigation';
import { LoginResponseData } from '@/types/apis';

const formSchema = z.object({
    email: z.string(),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters long.',
    }),
    rememberMe: z.boolean().default(false).optional(),
});

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { data } = await httpClient.post<LoginResponseData>('/auth/login', {
                username: values.email,
                password: values.password,
                expiresInMins: values.rememberMe ? 5 : 2,
            });
            const { accessToken, refreshToken } = data;
            await xior.post<Pick<LoginResponseData, 'accessToken' | 'refreshToken'>>(
                'http://localhost:3000/api/auth/tokens',
                {
                    accessToken,
                    refreshToken,
                    isRememberMe: values.rememberMe,
                }
            );
            router.push('/profile');
        } catch (error) {
            if (error instanceof XiorError) {
                console.log(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-600 mt-2">Please sign in to your account</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="you@example.com" {...field} className="pl-10" />
                                                <MailIcon
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                            </div>
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
                                            <div className="relative">
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="pl-10"
                                                />
                                                <LockIcon
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={18}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Remember me</FormLabel>
                                            <FormDescription>Stay signed in for 30 days</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot your password?
                    </a>
                </CardFooter>
            </Card>
        </div>
    );
}
