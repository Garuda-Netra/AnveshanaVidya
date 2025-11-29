import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from '../../utils/LRUCache';

describe('LRU Cache', () => {
  let cache: LRUCache<string, string>;

  beforeEach(() => {
    cache = new LRUCache<string, string>(3);
  });

  describe('Basic Operations', () => {
    it('should store and retrieve values', () => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing values', () => {
      cache.put('key1', 'value1');
      cache.put('key1', 'updated');

      expect(cache.get('key1')).toBe('updated');
      expect(cache.size()).toBe(1);
    });

    it('should check if key exists', () => {
      cache.put('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('Capacity Management', () => {
    it('should evict least recently used item when capacity exceeded', () => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.put('key4', 'value4'); // Should evict key1

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
      expect(cache.size()).toBe(3);
    });

    it('should update LRU order on get', () => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      // Access key1 to make it most recently used
      cache.get('key1');

      // Add key4, should evict key2 (not key1)
      cache.put('key4', 'value4');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update LRU order on put', () => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      // Update key1 to make it most recently used
      cache.put('key1', 'updated');

      // Add key4, should evict key2
      cache.put('key4', 'value4');

      expect(cache.get('key1')).toBe('updated');
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should throw error for invalid capacity', () => {
      expect(() => new LRUCache(0)).toThrow();
      expect(() => new LRUCache(-1)).toThrow();
    });
  });

  describe('Delete Operations', () => {
    beforeEach(() => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
    });

    it('should delete existing key', () => {
      expect(cache.delete('key2')).toBe(true);
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.size()).toBe(2);
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
      expect(cache.size()).toBe(3);
    });

    it('should allow adding new items after deletion', () => {
      cache.delete('key1');
      cache.put('key4', 'value4');

      expect(cache.get('key4')).toBe('value4');
      expect(cache.size()).toBe(3);
    });
  });

  describe('Clear and Reset', () => {
    beforeEach(() => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.get('key1'); // Generate some stats
    });

    it('should clear all entries', () => {
      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should reset statistics on clear', () => {
      cache.clear();
      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Keys, Values, and Entries', () => {
    beforeEach(() => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1'); // Move key1 to front
    });

    it('should return keys in LRU order', () => {
      const keys = cache.keys();
      expect(keys[0]).toBe('key1'); // Most recent
      expect(keys[keys.length - 1]).toBe('key2'); // Least recent
    });

    it('should return values in LRU order', () => {
      const values = cache.values();
      expect(values[0]).toBe('value1'); // Most recent
    });

    it('should return entries in LRU order', () => {
      const entries = cache.entries();
      expect(entries[0]).toEqual(['key1', 'value1']);
      expect(entries.length).toBe(3);
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      cache.put('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key2'); // Miss
      cache.get('key1'); // Hit

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });

    it('should calculate hit rate correctly', () => {
      cache.put('key1', 'value1');

      cache.get('key1'); // Hit
      cache.get('key1'); // Hit
      cache.get('key2'); // Miss
      cache.get('key2'); // Miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(50);
    });

    it('should handle zero hits and misses', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });

    it('should reset statistics', () => {
      cache.put('key1', 'value1');
      cache.get('key1');
      cache.get('key2');

      cache.resetStats();
      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('should include size and capacity in stats', () => {
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.capacity).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle capacity of 1', () => {
      const smallCache = new LRUCache<string, string>(1);
      
      smallCache.put('key1', 'value1');
      smallCache.put('key2', 'value2');

      expect(smallCache.get('key1')).toBeUndefined();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.size()).toBe(1);
    });

    it('should handle various data types', () => {
      const numberCache = new LRUCache<number, string>(3);
      
      numberCache.put(1, 'one');
      numberCache.put(2, 'two');

      expect(numberCache.get(1)).toBe('one');
      expect(numberCache.get(2)).toBe('two');
    });

    it('should handle object values', () => {
      interface User {
        name: string;
        age: number;
      }

      const objCache = new LRUCache<string, User>(3);
      
      objCache.put('user1', { name: 'Alice', age: 30 });
      objCache.put('user2', { name: 'Bob', age: 25 });

      const user = objCache.get('user1');
      expect(user?.name).toBe('Alice');
      expect(user?.age).toBe(30);
    });
  });

  describe('Forensics Use Case: Analysis Results Cache', () => {
    interface AnalysisResult {
      fileName: string;
      hash: string;
      status: string;
      timestamp: number;
    }

    let resultCache: LRUCache<string, AnalysisResult>;

    beforeEach(() => {
      resultCache = new LRUCache<string, AnalysisResult>(5);
      
      // Simulate caching analysis results
      resultCache.put('file1.img', {
        fileName: 'evidence1.img',
        hash: 'abc123',
        status: 'analyzed',
        timestamp: Date.now(),
      });

      resultCache.put('file2.img', {
        fileName: 'evidence2.img',
        hash: 'def456',
        status: 'analyzing',
        timestamp: Date.now(),
      });
    });

    it('should cache forensic analysis results', () => {
      const result = resultCache.get('file1.img');
      expect(result?.fileName).toBe('evidence1.img');
      expect(result?.hash).toBe('abc123');
    });

    it('should evict oldest results when capacity reached', () => {
      // Add more results to exceed capacity
      for (let i = 3; i <= 6; i++) {
        resultCache.put(`file${i}.img`, {
          fileName: `evidence${i}.img`,
          hash: `hash${i}`,
          status: 'analyzed',
          timestamp: Date.now(),
        });
      }

      // First result should be evicted
      expect(resultCache.get('file1.img')).toBeUndefined();
      expect(resultCache.get('file6.img')).toBeDefined();
    });

    it('should track cache hit rate for performance monitoring', () => {
      resultCache.get('file1.img'); // Hit
      resultCache.get('file1.img'); // Hit
      resultCache.get('file3.img'); // Miss

      const stats = resultCache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
    });
  });
});
