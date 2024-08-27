import jwt from 'jsonwebtoken';

// generated jwt key with 'openssl rand -base64 32' command
const secret = process.env.JWT || 'default';

// generate a token for user
export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
};

// verify a token of a user
export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};
