/* eslint-disable @typescript-eslint/no-explicit-any */
import xior from 'xior';

export const httpClient = xior.create({
    baseURL: 'https://dummyjson.com',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
});

httpClient.interceptors.request.use(
    async (config) => {
        const { data } = await xior.get('http://localhost:3000/api/auth/tokens');
        const { accessToken } = data;
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

let refreshTokenPromise: Promise<any> | null = null;

httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest) {
            if (!refreshTokenPromise) {
                const getToken = await xior.get('http://localhost:3000/api/auth/tokens');
                const { refreshToken, remember } = getToken.data;

                if (!refreshToken) return Promise.reject(error);

                console.log('Client Start Refresh Token');

                refreshTokenPromise = xior
                    .post(
                        'https://dummyjson.com/auth/refresh',
                        {
                            refreshToken,
                            expiresInMins: remember === 'true' ? 5 : 2,
                        },
                        { credentials: 'same-origin' }
                    )
                    .then(async (res) => {
                        const { accessToken, refreshToken } = res.data;
                        await xior.post('http://localhost:3000/api/auth/tokens', { accessToken, refreshToken });
                        httpClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
                        console.log('Success');
                    })
                    .catch(async () => {
                        console.log('Refresh Error');
                        await xior.delete('http://localhost:3000/api/auth/tokens');
                        if (typeof window !== 'undefined') {
                            location.href = '/auth/login';
                        }
                    })
                    .finally(() => {
                        refreshTokenPromise = null;
                    });
            }
            return refreshTokenPromise.then(() => {
                return httpClient.request(originalRequest);
            });
        }
        return Promise.reject(error);
    }
);
