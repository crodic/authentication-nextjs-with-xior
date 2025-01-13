'use server';

import { User } from '@/types/apis';
import { unstable_cache } from 'next/cache';
import xior from 'xior';

export const getUser = unstable_cache(async (token: string) => {
    const res = await xior.get<User>('https://dummyjson.com/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return res.data;
});
