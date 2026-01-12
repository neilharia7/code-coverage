const {
  findMax,
  findMin,
  average,
  removeDuplicates,
  flatten,
  chunk,
  shuffle
} = require('../src/arrayUtils');

describe('Array Utilities', () => {
  describe('findMax', () => {
    test('finds maximum in positive numbers', () => {
      expect(findMax([1, 5, 3, 9, 2])).toBe(9);
    });

    test('finds maximum in negative numbers', () => {
      expect(findMax([-1, -5, -3, -9, -2])).toBe(-1);
    });

    test('finds maximum in mixed numbers', () => {
      expect(findMax([-5, 0, 10, -3, 7])).toBe(10);
    });

    test('finds maximum in single element array', () => {
      expect(findMax([42])).toBe(42);
    });

    test('finds maximum with decimal numbers', () => {
      expect(findMax([1.5, 2.7, 1.2, 3.1])).toBe(3.1);
    });

    test('throws error for empty array', () => {
      expect(() => findMax([])).toThrow('Array cannot be empty');
    });

    test('throws error for non-array input', () => {
      expect(() => findMax('not an array')).toThrow(TypeError);
    });
  });

  describe('findMin', () => {
    test('finds minimum in positive numbers', () => {
      expect(findMin([1, 5, 3, 9, 2])).toBe(1);
    });

    test('finds minimum in negative numbers', () => {
      expect(findMin([-1, -5, -3, -9, -2])).toBe(-9);
    });

    test('finds minimum in mixed numbers', () => {
      expect(findMin([-5, 0, 10, -3, 7])).toBe(-5);
    });

    test('finds minimum in single element array', () => {
      expect(findMin([42])).toBe(42);
    });

    test('finds minimum with decimal numbers', () => {
      expect(findMin([1.5, 2.7, 1.2, 3.1])).toBe(1.2);
    });

    test('throws error for empty array', () => {
      expect(() => findMin([])).toThrow('Array cannot be empty');
    });

    test('throws error for non-array input', () => {
      expect(() => findMin('not an array')).toThrow(TypeError);
    });
  });

  describe('average', () => {
    test('calculates average of positive numbers', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    test('calculates average of negative numbers', () => {
      expect(average([-1, -2, -3])).toBe(-2);
    });

    test('calculates average of mixed numbers', () => {
      expect(average([-5, 0, 10])).toBeCloseTo(1.6666666666666667);
    });

    test('calculates average with decimal numbers', () => {
      expect(average([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });

    test('handles single element array', () => {
      expect(average([42])).toBe(42);
    });

    test('throws error for empty array', () => {
      expect(() => average([])).toThrow('Array cannot be empty');
    });

    test('throws error for non-array input', () => {
      expect(() => average('not an array')).toThrow(TypeError);
    });
  });

  describe('removeDuplicates', () => {
    test('removes duplicate numbers', () => {
      expect(removeDuplicates([1, 2, 2, 3, 3, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    test('removes duplicate strings', () => {
      expect(removeDuplicates(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    test('handles array with no duplicates', () => {
      expect(removeDuplicates([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    test('handles empty array', () => {
      expect(removeDuplicates([])).toEqual([]);
    });

    test('handles array with all duplicates', () => {
      expect(removeDuplicates([5, 5, 5, 5])).toEqual([5]);
    });

    test('preserves order of first occurrence', () => {
      expect(removeDuplicates([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
    });

    test('throws error for non-array input', () => {
      expect(() => removeDuplicates('not an array')).toThrow(TypeError);
    });
  });

  describe('flatten', () => {
    test('flattens nested array one level', () => {
      expect(flatten([1, [2, 3], [4, 5]], 1)).toEqual([1, 2, 3, 4, 5]);
    });

    test('flattens deeply nested array', () => {
      expect(flatten([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
    });

    test('handles already flat array', () => {
      expect(flatten([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    test('handles empty array', () => {
      expect(flatten([])).toEqual([]);
    });

    test('handles array with empty nested arrays', () => {
      expect(flatten([1, [], [2, 3]])).toEqual([1, 2, 3]);
    });

    test('flattens with specified depth', () => {
      expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);
    });

    test('throws error for non-array input', () => {
      expect(() => flatten('not an array')).toThrow(TypeError);
    });

    test('throws error for negative depth', () => {
      expect(() => flatten([1, [2, 3]], -1)).toThrow(RangeError);
    });
  });

  describe('chunk', () => {
    test('splits array into chunks of specified size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('splits array into equal chunks', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });

    test('splits array into single element chunks', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    test('handles array smaller than chunk size', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    test('handles empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    test('splits into chunks of size 3', () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    test('throws error for non-array input', () => {
      expect(() => chunk('not an array', 2)).toThrow(TypeError);
    });

    test('throws error for zero size', () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
    });

    test('throws error for negative size', () => {
      expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError);
    });

    test('throws error for non-integer size', () => {
      expect(() => chunk([1, 2, 3], 2.5)).toThrow(RangeError);
    });
  });

  describe('shuffle', () => {
    test('returns array with same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.length).toBe(arr.length);
    });

    test('returns array with same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    test('does not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });

    test('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    test('handles single element array', () => {
      expect(shuffle([42])).toEqual([42]);
    });

    test('handles array with duplicate values', () => {
      const arr = [1, 1, 2, 2, 3];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    test('throws error for non-array input', () => {
      expect(() => shuffle('not an array')).toThrow(TypeError);
    });

    test('produces different order on multiple calls (probabilistic)', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = [];
      // Run shuffle multiple times and check if we get different results
      for (let i = 0; i < 10; i++) {
        results.push(shuffle(arr).join(','));
      }
      // At least one should be different from the original order
      const uniqueResults = new Set(results);
      // This is probabilistic, but with 10 shuffles of 10 elements, 
      // we should get at least 2 different orders
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });
});
