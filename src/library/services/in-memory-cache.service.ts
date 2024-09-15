import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryCacheService {
  private cache: Map<string, any> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  private static defaultTTL = 12 * 60 * 1000; // 12 minutes

  /**
   * Set a value in memory with expiration.
   * @param key - The key to store the value.
   * @param value - The value to store.
   * @param ttl - Time to live in milliseconds.
   */
  setWithExpiration(key: string, value: any, ttl?: number): void {
    // Clear any existing timeout for the key if it exists
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Set the value in the cache
    this.cache.set(key, value);

    // Set a timeout to remove the key-value pair after ttl
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl || InMemoryCacheService.defaultTTL);

    // Store the timeout reference so it can be cleared later if needed
    this.timeouts.set(key, timeout);
  }

  /**
   * Get a value by key.
   * @param key - The key to retrieve the value.
   * @returns The value or undefined if not found or expired.
   */
  get(key: string): any {
    return this.cache.get(key);
  }

  /**
   * Delete a key manually if needed.
   * @param key - The key to delete.
   */
  delete(key: string): void {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)); // Clear the timeout
    }
    this.cache.delete(key); // Remove the key-value from the cache
    this.timeouts.delete(key); // Remove the timeout reference
  }

  /**
   * Check if a key exists in the cache.
   * @param key - The key to check.
   * @returns true if key exists, otherwise false.
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
}
