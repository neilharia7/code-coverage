const { reverse, isPalindrome, titleCase, truncate, countOccurrences } = require('../src/stringUtils');

describe('String Utilities', () => {
  describe('reverse', () => {
    test('reverses a simple string', () => {
      expect(reverse('hello')).toBe('olleh');
    });

    test('reverses an empty string', () => {
      expect(reverse('')).toBe('');
    });

    test('reverses a single character', () => {
      expect(reverse('a')).toBe('a');
    });

    test('reverses a string with spaces', () => {
      expect(reverse('hello world')).toBe('dlrow olleh');
    });

    test('throws error for non-string input', () => {
      expect(() => reverse(123)).toThrow(TypeError);
    });
  });

  describe('isPalindrome', () => {
    test('identifies a palindrome', () => {
      expect(isPalindrome('racecar')).toBe(true);
    });

    test('identifies a non-palindrome', () => {
      expect(isPalindrome('hello')).toBe(false);
    });

    test('handles mixed case', () => {
      expect(isPalindrome('RaceCar')).toBe(true);
    });

    test('handles spaces and punctuation', () => {
      expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
    });

    test('empty string is a palindrome', () => {
      expect(isPalindrome('')).toBe(true);
    });

    test('throws error for non-string input', () => {
      expect(() => isPalindrome(123)).toThrow(TypeError);
    });
  });

  describe('titleCase', () => {
    test('capitalizes first letter of each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });

    test('handles already capitalized text', () => {
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });

    test('handles single word', () => {
      expect(titleCase('hello')).toBe('Hello');
    });

    test('handles empty string', () => {
      expect(titleCase('')).toBe('');
    });

    test('throws error for non-string input', () => {
      expect(() => titleCase(123)).toThrow(TypeError);
    });
  });

  describe('truncate', () => {
    test('truncates long strings', () => {
      expect(truncate('Hello, World!', 10)).toBe('Hello, ...');
    });

    test('does not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    test('handles exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    test('throws error for negative maxLength', () => {
      expect(() => truncate('Hello', -1)).toThrow(RangeError);
    });

    test('throws error for non-string input', () => {
      expect(() => truncate(123, 10)).toThrow(TypeError);
    });
  });

  describe('countOccurrences', () => {
    test('counts occurrences of substring', () => {
      expect(countOccurrences('hello hello hello', 'hello')).toBe(3);
    });

    test('returns 0 for no matches', () => {
      expect(countOccurrences('hello world', 'xyz')).toBe(0);
    });

    test('returns 0 for empty substring', () => {
      expect(countOccurrences('hello', '')).toBe(0);
    });

    test('handles overlapping matches (non-overlapping count)', () => {
      expect(countOccurrences('aaa', 'aa')).toBe(1);
    });

    test('throws error for non-string input', () => {
      expect(() => countOccurrences(123, 'a')).toThrow(TypeError);
    });
  });
});
