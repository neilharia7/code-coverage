/**
 * String utility functions
 */

/**
 * Reverses a string
 * @param {string} str - The string to reverse
 * @returns {string} The reversed string
 */
function reverse(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return str.split('').reverse().join('');
}

/**
 * Checks if a string is a palindrome
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a palindrome
 */
function isPalindrome(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

/**
 * Capitalizes the first letter of each word
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
function titleCase(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncates a string to a specified length with ellipsis
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} The truncated string
 */
function truncate(str, maxLength) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string');
  }
  if (maxLength < 0) {
    throw new RangeError('maxLength must be non-negative');
  }
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Counts the occurrences of a substring
 * @param {string} str - The string to search in
 * @param {string} substring - The substring to count
 * @returns {number} The count of occurrences
 */
function countOccurrences(str, substring) {
  if (typeof str !== 'string' || typeof substring !== 'string') {
    throw new TypeError('Both arguments must be strings');
  }
  if (substring.length === 0) {
    return 0;
  }
  let count = 0;
  let position = 0;
  while ((position = str.indexOf(substring, position)) !== -1) {
    count++;
    position += substring.length;
  }
  return count;
}

module.exports = {
  reverse,
  isPalindrome,
  titleCase,
  truncate,
  countOccurrences
};
