'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
export const httpClient = async (
    url,
    customHeaders = {},
    body = {},
    method = 'GET',
    hasPrefixHeader = true,
    isRefresh = false,
    searchParams,
    msg = 'Vui lòng đăng nhập!'
) => {
    try {
        const options = {
            cache: 'no-cache',
            headers: {
                ...customHeaders,
            },
            method,
        };
        if (hasPrefixHeader) {
            options.headers[process.env.NEXT_PUBLIC_PREFIX_HEADER_KEY] = process.env.NEXT_PUBLIC_PREFIX_HEADER_VALUE;
        }
        if (Object.keys(body).length > 0) {
            if (method === 'GET') {
                const searchParams = new URLSearchParams(body);
                url = url + '?' + searchParams.toString();
            } else {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
        } else if (body instanceof FormData) {
            options.body = body;
        }
        const response = await fetch(url, options);
        // Không cần xử lý refresh token nữa vì khi chạy qua middleware thì nó đã tự động lấy lại rồi
        const data = await response.json();
        // Xử lý lấy token ở ngay sau đây
        if (data.status == 401 && !isRefresh) {
            const refreshToken = cookies().get('refreshToken')?.value;
            if (refreshToken) {
                const response = await fetch(process.env.NEXT_PUBLIC_ENDPOINT_URL + 'auth/refresh-token', {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': '123456',
                    },
                    body: JSON.stringify({ refreshToken }),
                });
                const data = await response.json();
                if (data.status == 200) {
                    cookies().set({
                        name: 'token',
                        value: data.data.accessToken,
                        httpOnly: true,
                        secure: true,
                        path: '/',
                        sameSite: 'strict',
                    });
                    cookies().set({
                        name: 'refreshToken',
                        value: data.data.refreshToken,
                        httpOnly: true,
                        secure: true,
                        path: '/',
                        sameSite: 'strict',
                    });
                    return await httpClient(
                        url,
                        {
                            ...customHeaders,
                            Authorization: `Bearer ${data.data.accessToken}`,
                        },
                        body,
                        method,
                        hasPrefixHeader,
                        true
                    );
                } else return clearTokensAndRedirect();
            }
        }
        return data;
    } catch (e) {
        console.log(e);
        // return handleLoginRedirect(msg, searchParams)
    }
};
function clearTokensAndRedirect() {
    cookies().delete('token');
    cookies().delete('refreshToken');
    cookies().set('msg', 'Vui lòng đăng nhập!');
    return redirect('/dang-nhap');
}
