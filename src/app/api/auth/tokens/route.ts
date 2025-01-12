import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';

export const GET = async () => {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value || '';
    const refreshToken = cookieStore.get('refreshToken')?.value || '';
    const remember = cookieStore.get('remember')?.value || 'false';

    return Response.json({ accessToken, refreshToken, remember }, { status: 200 });
};

export const POST = async (req: Request) => {
    const body = await req.json();
    const cookieStore = cookies();
    const { accessToken, refreshToken, isRememberMe } = body;

    const expAccessToken = decodeJwt(accessToken).exp;
    const expRefreshToken = decodeJwt(refreshToken).exp;

    if (!expAccessToken || !expRefreshToken) {
        return Response.json({ message: 'Error' }, { status: 400 });
    }

    if (isRememberMe === true) {
        cookieStore.set('remember', 'true', { path: '/', expires: new Date(expRefreshToken * 1000) });
    }

    cookieStore.set('accessToken', accessToken, {
        path: '/',
        httpOnly: true,
        expires: new Date(expAccessToken * 1000),
    });
    cookieStore.set('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        expires: new Date(expRefreshToken * 1000),
    });

    return Response.json({ accessToken, refreshToken }, { status: 200 });
};

export const DELETE = async () => {
    const cookieStore = cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('remember');
    return Response.json({ message: 'Success' }, { status: 200 });
};
