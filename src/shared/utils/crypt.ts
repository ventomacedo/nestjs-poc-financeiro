import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 32;
const TAG_LENGTH = 16;
//$2b$12$Aco2FvnJ7dYM.U8ElWj42OiXM/s0ppK.q7prbLZsEslc8CPbl4YtC
export const encrypt = (input: string) => {
    const key = String(process.env.TWO_FACTOR_SECRET_KEY);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(input, 'utf-8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, tag]).toString('base64');
};

export const decrypt = (input: string) => {
    const key = String(process.env.TWO_FACTOR_SECRET_KEY);
    const payload = Buffer.from(input, 'base64');
    const iv = payload.subarray(0, IV_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH, payload.length - TAG_LENGTH);
    const tag = payload.subarray(payload.length - TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
};
