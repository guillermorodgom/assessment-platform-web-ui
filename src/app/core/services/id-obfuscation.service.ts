import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IdObfuscationService {
  private readonly secret = environment.storageEncryptionKey;

  encode(id: number): string {
    const encrypted = CryptoJS.AES.encrypt(String(id), this.secret).toString();
    return this.base64ToBase64Url(encrypted);
  }

  decode(token: string): number | null {
    try {
      const base64 = this.base64UrlToBase64(token);
      const bytes = CryptoJS.AES.decrypt(base64, this.secret);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      const id = Number(decrypted);
      return isNaN(id) || id <= 0 ? null : id;
    } catch {
      return null;
    }
  }

  private base64ToBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private base64UrlToBase64(base64url: string): string {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad === 2) base64 += '==';
    else if (pad === 3) base64 += '=';
    return base64;
  }
}
