/**
 * Array utility functions
 */

/**
 * Finds the maximum value in an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} The maximum value
 * @throws {TypeError} When input is not an array
 * @throws {Error} When array is empty
 */
function findMax(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  if (arr.length === 0) {
    throw new Error('Array cannot be empty');
  }
  return Math.max(...arr);
}

/**
 * Finds the minimum value in an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} The minimum value
 * @throws {TypeError} When input is not an array
 * @throws {Error} When array is empty
 */
function findMin(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  if (arr.length === 0) {
    throw new Error('Array cannot be empty');
  }
  return Math.min(...arr);
}

/**
 * Calculates the average of numbers in an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} The average value
 * @throws {TypeError} When input is not an array
 * @throws {Error} When array is empty
 */
function average(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  if (arr.length === 0) {
    throw new Error('Array cannot be empty');
  }
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

/**
 * Removes duplicate values from an array
 * @param {any[]} arr - Array of any type
 * @returns {any[]} Array with duplicates removed
 * @throws {TypeError} When input is not an array
 */
function removeDuplicates(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  return [...new Set(arr)];
}

/**
 * Flattens a nested array to a single level
 * @param {any[]} arr - Array that may contain nested arrays
 * @param {number} depth - Depth to flatten (default: Infinity)
 * @returns {any[]} Flattened array
 * @throws {TypeError} When input is not an array
 */
function flatten(arr, depth = Infinity) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  if (depth < 0) {
    throw new RangeError('Depth must be non-negative');
  }
  return arr.flat(depth);
}

/**
 * Splits an array into chunks of specified size
 * @param {any[]} arr - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {any[][]} Array of chunks
 * @throws {TypeError} When input is not an array
 * @throws {RangeError} When size is not positive
 */
function chunk(arr, size) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  if (size <= 0 || !Number.isInteger(size)) {
    throw new RangeError('Size must be a positive integer');
  }
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {any[]} arr - Array to shuffle
 * @returns {any[]} New shuffled array (original array is not modified)
 * @throws {TypeError} When input is not an array
 */
function shuffle(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Input must be an array');
  }
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  findMax,
  findMin,
  average,
  removeDuplicates,
  flatten,
  chunk,
  shuffle
};
