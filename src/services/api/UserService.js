import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getUserFromRequest(request) {
    const token = cookies().get('token')?.value;
    if (!token) return null;

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) throw new Error('No JWT secret key found in environment variables.');

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secretKey));
        const user = payload.sub;
        if (!user) throw new Error('No user found in token payload.');

        return user;
    } catch (err) {
        console.error(err);
        return null;
    }
}