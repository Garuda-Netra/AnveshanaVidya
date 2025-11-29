import { describe, it, expect, beforeEach } from 'vitest';
import { Trie } from '../../utils/Trie';

describe('Trie Data Structure', () => {
  let trie: Trie;

  beforeEach(() => {
    trie = new Trie();
  });

  describe('Insert and Search', () => {
    it('should insert and find words', () => {
      trie.insert('autopsy');
      trie.insert('wireshark');
      trie.insert('volatility');

      expect(trie.search('autopsy')).toBe(true);
      expect(trie.search('wireshark')).toBe(true);
      expect(trie.search('volatility')).toBe(true);
      expect(trie.search('nonexistent')).toBe(false);
    });

    it('should handle case-insensitive search', () => {
      trie.insert('Autopsy');
      expect(trie.search('autopsy')).toBe(true);
      expect(trie.search('AUTOPSY')).toBe(true);
      expect(trie.search('AuToPsY')).toBe(true);
    });

    it('should not find partial words', () => {
      trie.insert('autopsy');
      expect(trie.search('auto')).toBe(false);
      expect(trie.search('autop')).toBe(false);
    });

    it('should handle empty string', () => {
      trie.insert('');
      expect(trie.search('')).toBe(false);
      expect(trie.getSize()).toBe(0);
    });

    it('should handle duplicate insertions', () => {
      trie.insert('autopsy');
      trie.insert('autopsy');
      trie.insert('Autopsy');
      expect(trie.getSize()).toBe(1);
    });
  });

  describe('StartsWith (Prefix Search)', () => {
    beforeEach(() => {
      trie.insert('autopsy');
      trie.insert('automate');
      trie.insert('wireshark');
    });

    it('should find words with prefix', () => {
      expect(trie.startsWith('auto')).toBe(true);
      expect(trie.startsWith('wire')).toBe(true);
      expect(trie.startsWith('au')).toBe(true);
    });

    it('should not find non-existent prefixes', () => {
      expect(trie.startsWith('xyz')).toBe(false);
      expect(trie.startsWith('win')).toBe(false);
    });

    it('should handle empty prefix', () => {
      expect(trie.startsWith('')).toBe(true);
    });

    it('should handle full word as prefix', () => {
      expect(trie.startsWith('autopsy')).toBe(true);
    });
  });

  describe('Autocomplete', () => {
    beforeEach(() => {
      trie.insert('autopsy');
      trie.insert('automate');
      trie.insert('automatic');
      trie.insert('automation');
      trie.insert('wireshark');
      trie.insert('wire');
    });

    it('should return all words with prefix', () => {
      const results = trie.autocomplete('auto');
      expect(results).toContain('autopsy');
      expect(results).toContain('automate');
      expect(results).toContain('automatic');
      expect(results).toContain('automation');
      expect(results.length).toBe(4);
    });

    it('should respect limit parameter', () => {
      const results = trie.autocomplete('auto', 2);
      expect(results.length).toBe(2);
    });

    it('should return empty array for non-existent prefix', () => {
      const results = trie.autocomplete('xyz');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty prefix', () => {
      const results = trie.autocomplete('');
      expect(results).toEqual([]);
    });

    it('should include prefix if it is a word', () => {
      const results = trie.autocomplete('wire');
      expect(results).toContain('wire');
      expect(results).toContain('wireshark');
    });
  });

  describe('Delete', () => {
    beforeEach(() => {
      trie.insert('autopsy');
      trie.insert('automate');
      trie.insert('wireshark');
    });

    it('should delete existing word', () => {
      expect(trie.delete('autopsy')).toBe(true);
      expect(trie.search('autopsy')).toBe(false);
      expect(trie.getSize()).toBe(2);
    });

    it('should not affect other words with same prefix', () => {
      trie.delete('autopsy');
      expect(trie.search('automate')).toBe(true);
      expect(trie.startsWith('auto')).toBe(true);
    });

    it('should return false when deleting non-existent word', () => {
      expect(trie.delete('nonexistent')).toBe(false);
      expect(trie.getSize()).toBe(3);
    });

    it('should handle empty string deletion', () => {
      expect(trie.delete('')).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should track size correctly', () => {
      expect(trie.getSize()).toBe(0);
      
      trie.insert('autopsy');
      expect(trie.getSize()).toBe(1);
      
      trie.insert('wireshark');
      expect(trie.getSize()).toBe(2);
      
      trie.delete('autopsy');
      expect(trie.getSize()).toBe(1);
    });

    it('should clear all words', () => {
      trie.insert('autopsy');
      trie.insert('wireshark');
      trie.insert('volatility');
      
      trie.clear();
      
      expect(trie.getSize()).toBe(0);
      expect(trie.search('autopsy')).toBe(false);
      expect(trie.search('wireshark')).toBe(false);
    });

    it('should get all words', () => {
      trie.insert('autopsy');
      trie.insert('wireshark');
      trie.insert('volatility');
      
      const allWords = trie.getAllWords();
      expect(allWords.length).toBe(3);
      expect(allWords).toContain('autopsy');
      expect(allWords).toContain('wireshark');
      expect(allWords).toContain('volatility');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single character words', () => {
      trie.insert('a');
      trie.insert('b');
      
      expect(trie.search('a')).toBe(true);
      expect(trie.search('b')).toBe(true);
    });

    it('should handle very long words', () => {
      const longWord = 'a'.repeat(1000);
      trie.insert(longWord);
      expect(trie.search(longWord)).toBe(true);
    });

    it('should handle special characters', () => {
      trie.insert('file-system');
      trie.insert('user@domain');
      
      expect(trie.search('file-system')).toBe(true);
      expect(trie.search('user@domain')).toBe(true);
    });

    it('should preserve original casing in autocomplete', () => {
      trie.insert('AutoPsy');
      trie.insert('WIRESHARK');
      
      const results = trie.autocomplete('auto');
      expect(results[0]).toBe('AutoPsy');
    });
  });

  describe('Forensics Use Case: Tool Name Search', () => {
    beforeEach(() => {
      // Common forensic tools
      const tools = [
        'Autopsy', 'Volatility', 'Wireshark', 'Tcpdump',
        'FTK Imager', 'EnCase', 'Sleuth Kit', 'Bulk Extractor',
        'Binwalk', 'Foremost', 'Scalpel', 'PhotoRec'
      ];
      
      tools.forEach(tool => trie.insert(tool));
    });

    it('should provide autocomplete for forensic tools', () => {
      const results = trie.autocomplete('au');
      expect(results).toContain('Autopsy');
    });

    it('should search for exact tool names', () => {
      expect(trie.search('Wireshark')).toBe(true);
      expect(trie.search('wireshark')).toBe(true);
    });

    it('should suggest tools starting with prefix', () => {
      const results = trie.autocomplete('b');
      expect(results).toContain('Binwalk');
      expect(results).toContain('Bulk Extractor');
    });
  });
});
