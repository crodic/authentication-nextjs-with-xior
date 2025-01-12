import { clsx, type ClassValue } from 'clsx';
import { decodeJwt } from 'jose';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function decodeToken(token: string) {
    try {
        const payload = decodeJwt(token);
        return payload;
    } catch (error) {
        console.log(error);
        return null;
    }
}
