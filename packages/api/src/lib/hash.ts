import { compare, hash } from '@node-rs/bcrypt';

const SALT_ROUNDS = 10; // Número de rounds para o salt (custo)

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}
