/**
 * TrieNode represents a single node in the Trie data structure
 */
class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  value?: string; // Store the complete word at end nodes

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

/**
 * Trie (Prefix Tree) - Efficient data structure for string operations
 * Use cases:
 * - Autocomplete suggestions
 * - Spell checking
 * - IP routing (longest prefix matching)
 * - Search suggestions in forensic tool names
 * 
 * Time Complexity:
 * - Insert: O(m) where m is the length of the word
 * - Search: O(m)
 * - StartsWith: O(m)
 * - Autocomplete: O(m + n) where n is number of results
 * 
 * Space Complexity: O(ALPHABET_SIZE * N * M) where N is number of words, M is average length
 */
export class Trie {
  private root: TrieNode;
  private size: number;

  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  /**
   * Insert a word into the trie
   * @param word - The word to insert
   */
  insert(word: string): void {
    if (!word || word.length === 0) {
      return;
    }

    let current = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }

    if (!current.isEndOfWord) {
      current.isEndOfWord = true;
      current.value = word; // Store original word (with casing)
      this.size++;
    }
  }

  /**
   * Search for an exact word in the trie
   * @param word - The word to search for
   * @returns true if the word exists, false otherwise
   */
  search(word: string): boolean {
    if (!word || word.length === 0) {
      return false;
    }

    const node = this.findNode(word.toLowerCase());
    return node !== null && node.isEndOfWord;
  }

  /**
   * Check if there is any word in the trie that starts with the given prefix
   * @param prefix - The prefix to check
   * @returns true if any word starts with the prefix
   */
  startsWith(prefix: string): boolean {
    if (!prefix || prefix.length === 0) {
      return true; // Empty prefix matches everything
    }

    return this.findNode(prefix.toLowerCase()) !== null;
  }

  /**
   * Find all words that start with the given prefix (autocomplete)
   * @param prefix - The prefix to search for
   * @param limit - Maximum number of suggestions to return (default: 10)
   * @returns Array of words that start with the prefix
   */
  autocomplete(prefix: string, limit: number = 10): string[] {
    const results: string[] = [];
    
    if (!prefix || prefix.length === 0) {
      return results;
    }

    const normalizedPrefix = prefix.toLowerCase();
    const startNode = this.findNode(normalizedPrefix);

    if (!startNode) {
      return results;
    }

    // If the prefix itself is a word, add it first
    if (startNode.isEndOfWord && startNode.value) {
      results.push(startNode.value);
    }

    // DFS to find all words with this prefix
    this.dfsCollect(startNode, results, limit);

    return results;
  }

  /**
   * Delete a word from the trie
   * @param word - The word to delete
   * @returns true if the word was deleted, false if it didn't exist
   */
  delete(word: string): boolean {
    if (!word || word.length === 0) {
      return false;
    }

    const normalizedWord = word.toLowerCase();
    const node = this.findNode(normalizedWord);
    
    if (!node || !node.isEndOfWord) {
      return false; // Word doesn't exist
    }

    // Mark as not end of word and decrement size
    node.isEndOfWord = false;
    node.value = undefined;
    this.size--;

    // Now clean up nodes if needed
    this.deleteHelper(this.root, normalizedWord, 0);
    return true;
  }

  /**
   * Get the total number of words stored in the trie
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Clear all words from the trie
   */
  clear(): void {
    this.root = new TrieNode();
    this.size = 0;
  }

  /**
   * Get all words in the trie
   * @returns Array of all words
   */
  getAllWords(): string[] {
    const results: string[] = [];
    this.dfsCollect(this.root, results, Infinity);
    return results;
  }

  /**
   * Helper method to find a node by prefix
   * @param prefix - The prefix to search for
   * @returns The node at the end of the prefix, or null if not found
   */
  private findNode(prefix: string): TrieNode | null {
    let current = this.root;

    for (const char of prefix) {
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char)!;
    }

    return current;
  }

  /**
   * DFS helper to collect words from a given node
   * @param node - Starting node
   * @param results - Array to collect results
   * @param limit - Maximum number of results
   */
  private dfsCollect(node: TrieNode, results: string[], limit: number): void {
    if (results.length >= limit) {
      return;
    }

    for (const [, childNode] of node.children) {
      if (childNode.isEndOfWord && childNode.value) {
        results.push(childNode.value);
        if (results.length >= limit) {
          return;
        }
      }

      this.dfsCollect(childNode, results, limit);

      if (results.length >= limit) {
        return;
      }
    }
  }

  /**
   * Recursive helper for delete operation (cleanup phase)
   * @param node - Current node
   * @param word - Word to delete
   * @param index - Current character index
   * @returns true if the current node should be deleted
   */
  private deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      // Delete this node if it has no children
      return node.children.size === 0;
    }

    const char = word[index];
    const childNode = node.children.get(char);

    if (!childNode) {
      return false;
    }

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      // Delete current node if it has no children and is not end of another word
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }
}

export default Trie;
