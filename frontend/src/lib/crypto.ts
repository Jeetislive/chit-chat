import nacl from "tweetnacl";
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from "tweetnacl-util";

const SECRET_KEY_STORAGE = "e2e_secretKey";
const PUBLIC_KEY_STORAGE = "e2e_publicKey";
const publicKeyCache = new Map<string, string>();

export function generateAndStoreKeyPair(): string {
  const pair = nacl.box.keyPair();
  localStorage.setItem(SECRET_KEY_STORAGE, encodeBase64(pair.secretKey));
  localStorage.setItem(PUBLIC_KEY_STORAGE, encodeBase64(pair.publicKey));
  return encodeBase64(pair.publicKey);
}

export function getMyPublicKey(): string | null {
  return localStorage.getItem(PUBLIC_KEY_STORAGE);
}

export function getMySecretKey(): Uint8Array | null {
  const stored = localStorage.getItem(SECRET_KEY_STORAGE);
  return stored ? decodeBase64(stored) : null;
}

export function cachePublicKey(userId: string, publicKey: string): void {
  if (publicKey) publicKeyCache.set(userId, publicKey);
}

export function getCachedPublicKey(userId: string): string | undefined {
  return publicKeyCache.get(userId);
}

export function encryptMessage(
  plaintext: string,
  recipientPublicKeyBase64: string
): { content: string; nonce: string } | null {
  const mySecretKey = getMySecretKey();
  if (!mySecretKey) return null;

  const recipientPublicKey = decodeBase64(recipientPublicKeyBase64);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = decodeUTF8(plaintext);
  const encrypted = nacl.box(messageBytes, nonce, recipientPublicKey, mySecretKey);

  if (!encrypted) return null;

  return {
    content: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}

export function decryptMessage(
  encryptedContent: string,
  nonce: string,
  senderPublicKeyBase64: string
): string | null {
  const mySecretKey = getMySecretKey();
  if (!mySecretKey) return null;

  try {
    const senderPublicKey = decodeBase64(senderPublicKeyBase64);
    const encryptedBytes = decodeBase64(encryptedContent);
    const nonceBytes = decodeBase64(nonce);
    const decrypted = nacl.box.open(encryptedBytes, nonceBytes, senderPublicKey, mySecretKey);
    if (!decrypted) return null;
    return encodeUTF8(decrypted);
  } catch {
    return null;
  }
}

export function clearKeys(): void {
  localStorage.removeItem(SECRET_KEY_STORAGE);
  localStorage.removeItem(PUBLIC_KEY_STORAGE);
  publicKeyCache.clear();
}
