/**
 * Node for Doubly Linked List used in LRU Cache
 */
class LRUNode<K, V> {
  key: K;
  value: V;
  prev: LRUNode<K, V> | null;
  next: LRUNode<K, V> | null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

/**
 * LRU (Least Recently Used) Cache
 * 
 * Use cases:
 * - Cache forensic analysis results
 * - Cache frequently accessed file metadata
 * - Cache decoded network packets
 * - Cache search results
 * 
 * Time Complexity:
 * - get: O(1)
 * - put: O(1)
 * - All operations are constant time
 * 
 * Space Complexity: O(capacity)
 * 
 * Implementation:
 * - Uses HashMap for O(1) access
 * - Uses Doubly Linked List to maintain order (most recent at head)
 * - Head always points to most recently used item
 * - Tail points to least recently used item
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, LRUNode<K, V>>;
  private head: LRUNode<K, V> | null; // Most recently used
  private tail: LRUNode<K, V> | null; // Least recently used
  private hits: number;
  private misses: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }

    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get value from cache
   * @param key - The key to look up
   * @returns The value if found, undefined otherwise
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      return undefined;
    }

    this.hits++;
    // Move accessed node to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  /**
   * Put key-value pair into cache
   * @param key - The key
   * @param value - The value
   */
  put(key: K, value: V): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      // Update existing node
      existingNode.value = value;
      this.moveToHead(existingNode);
      return;
    }

    // Create new node
    const newNode = new LRUNode(key, value);
    this.cache.set(key, newNode);

    // Add to head
    this.addToHead(newNode);

    // Check capacity
    if (this.cache.size > this.capacity) {
      // Remove least recently used (tail)
      this.removeTail();
    }
  }

  /**
   * Check if key exists in cache
   * @param key - The key to check
   * @returns true if key exists, false otherwise
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   * @param key - The key to delete
   * @returns true if deleted, false if key didn't exist
   */
  delete(key: K): boolean {
    const node = this.cache.get(key);

    if (!node) {
      return false;
    }

    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get current size of cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache capacity
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Get all keys in cache (from most to least recently used)
   */
  keys(): K[] {
    const keys: K[] = [];
    let current = this.head;

    while (current) {
      keys.push(current.key);
      current = current.next;
    }

    return keys;
  }

  /**
   * Get all values in cache (from most to least recently used)
   */
  values(): V[] {
    const values: V[] = [];
    let current = this.head;

    while (current) {
      values.push(current.value);
      current = current.next;
    }

    return values;
  }

  /**
   * Get all entries in cache (from most to least recently used)
   */
  entries(): Array<[K, V]> {
    const entries: Array<[K, V]> = [];
    let current = this.head;

    while (current) {
      entries.push([current.key, current.value]);
      current = current.next;
    }

    return entries;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    capacity: number;
  } {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : this.hits / total;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 10000) / 100, // Percentage with 2 decimals
      size: this.cache.size,
      capacity: this.capacity,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Move node to head (most recently used position)
   */
  private moveToHead(node: LRUNode<K, V>): void {
    if (node === this.head) {
      return; // Already at head
    }

    this.removeNode(node);
    this.addToHead(node);
  }

  /**
   * Add node to head
   */
  private addToHead(node: LRUNode<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  /**
   * Remove a node from the linked list
   */
  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      // Node is head
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      // Node is tail
      this.tail = node.prev;
    }
  }

  /**
   * Remove tail (least recently used) node
   */
  private removeTail(): void {
    if (!this.tail) {
      return;
    }

    const tailNode = this.tail;
    this.removeNode(tailNode);
    this.cache.delete(tailNode.key);
  }
}

export default LRUCache;
