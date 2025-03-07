'use client';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { httpClient } from '@/lib/httpClient';
import { User } from '@/types/apis';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import xior, { XiorError } from 'xior';

export default function ProfileView() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const signOut = async () => {
        await xior.post<{ message: string }>('http://localhost:3000/api/auth/logout', {
            credentials: 'same-origin',
        });
        router.push('/auth/login');
    };

    useEffect(() => {
        async function getUser() {
            try {
                const res = await httpClient.get<User>('/auth/me');
                console.log('Request /auth/me', res.data);
                setUser(res.data);
            } catch (error) {
                if (error instanceof XiorError) console.log(error.message);
            }
        }

        getUser();
    }, []);

    return (
        <Card>
            <CardHeader>
                <Link href={'/'}>Hello Client - {JSON.stringify(user, null, 2)}</Link>
            </CardHeader>
            <CardFooter>
                <Button onClick={signOut}>Logout</Button>
            </CardFooter>
        </Card>
    );
}
