import { pbkdf2Sync } from 'crypto';
import { config } from '../../config/app.config';

export const encryptValue = async (value: string) => {
  const encrypted = await pbkdf2Sync(
    value,
    config.CRYPTO.SECRET,
    1000,
    64,
    'sha512',
  ).toString('hex');
  return encrypted;
};

// export const compareValue = async (value: string, hashedValue: string) => {
//   const compare = await bcrypt.compare(value, hashedValue);
//   return compare;
// };
