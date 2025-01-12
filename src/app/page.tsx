import { getUser } from '@/actions/get-user';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
    const user = await getUser(cookies().get('accessToken')?.value || '');
    return (
        <div className="flex justify-center items-center h-screen p-10">
            <Link href="/profile" className="flex flex-col flex-wrap">
                Hello {user.email}
            </Link>
        </div>
    );
}
