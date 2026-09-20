import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly secret = environment.storageEncryptionKey;
  private readonly enabled = environment.cryptoCookies;

  setItem(key: string, value: string): void {
    const storedValue = this.enabled ? CryptoJS.AES.encrypt(value, this.secret).toString() : value;
    sessionStorage.setItem(this.storageKey(key), storedValue);
  }

  getItem(key: string): string | null {
    const stored = sessionStorage.getItem(this.storageKey(key));
    if (!stored) return null;
    if (!this.enabled) return stored;
    try {
      const bytes = CryptoJS.AES.decrypt(stored, this.secret);
      return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(this.storageKey(key));
  }

  clear(): void {
    sessionStorage.clear();
  }

  /**
   * Nombre de la llave en sessionStorage. Con cryptoCookies activo se usa un HMAC-SHA256
   * (determinístico, para poder buscarla de nuevo) en lugar del nombre en claro.
   */
  private storageKey(key: string): string {
    return this.enabled ? CryptoJS.HmacSHA256(key, this.secret).toString(CryptoJS.enc.Hex) : key;
  }
}
