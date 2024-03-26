import generateKeys from '../src/UtilityScripts/GenerateKeys.js';

describe('Key Generation - Comprehensive Tests', () => {
    // NUMBERS ASCENDING
    describe('NUMBERS ASCENDING', () => {
      const tests = [
        {args: [5, 'asc', 'number', [], true], expectedKeys: [1, 2, 3, 4, 5], expectedRange: [1, 5]},
        {args: [5, 'asc', 'number', [3], true], expectedKeys: [4, 5, 6, 7, 8], expectedRange: [4, 8]},
        {args: [5, 'asc', 'number', [3], false], expectedKeys: [4, 5, 6, 7, 8], expectedRange: [4, 8]},
        {args: [5, 'asc', 'number', [-3.5], false], expectedKeys: [-3, -2, -1, 0, 1], expectedRange: [-3, 1]},
        {args: [5, 'asc', 'number', [1, 2, 3], false], expectedKeys: [4, 5, 6, 7, 8], expectedRange: [4, 8]},
      ];
  
      tests.forEach(({args, expectedKeys, expectedRange}, index) => {
        test(`Test ${index + 1}: generates keys with args ${args}`, () => {
          const { generatedKeys, range } = generateKeys(...args);
          expect(generatedKeys).toEqual(expectedKeys);
          expect(range).toEqual(expectedRange);
        });
      });
    });

    // STRINGS ASCENDING
  describe('STRINGS ASCENDING', () => {
    const tests = [
      {args: [5, 'asc', 'string', [], true], expectedKeys: ['"A"', '"B"', '"C"', '"D"', '"E"'], expectedRange: ['"A"', '"E"']},
      {args: [5, 'asc', 'string', ['"Y"'], true], expectedKeys: ['"Z"', '"a"', '"b"', '"c"', '"d"'], expectedRange: ['"Z"', '"d"']},
      {args: [5, 'asc', 'string', ['"a"', '"ab"', '"x "', '"y$y"'], true], expectedKeys: ['"y$z"', '"z"', '"zA"', '"zAA"', '"zAB"'], expectedRange: ['"y$z"', '"zAB"']},
    ];

    tests.forEach(({args, expectedKeys, expectedRange}, index) => {
      test(`Test ${index + 1}: generates keys with args ${args}`, () => {
        const { generatedKeys, range } = generateKeys(...args);
        expect(generatedKeys).toEqual(expectedKeys);
        expect(range).toEqual(expectedRange);
      });
    });
  });

  // NUMBERS DESCENDING
  describe('NUMBERS DESCENDING', () => {
    const tests = [
      {args: [5, 'desc', 'number', [], true], expectedKeys: [5, 4, 3, 2, 1], expectedRange: [1, 5]},
      {args: [5, 'desc', 'number', [3], true], expectedKeys: [2, 1, 0, -1, -2], expectedRange: [-2, 2]},
      {args: [5, 'desc', 'number', [3], false], expectedKeys: [2, 1, 0, -1, -2], expectedRange: [-2, 2]},
      {args: [5, 'desc', 'number', [-3.5], false], expectedKeys: [-4, -5, -6, -7, -8], expectedRange: [-8, -4]},
      {args: [5, 'desc', 'number', [1, 2, 3], false], expectedKeys: [0, -1, -2, -3, -4], expectedRange: [-4, 0]},
    ];

    tests.forEach(({args, expectedKeys, expectedRange}, index) => {
      test(`Test ${index + 1}: generates keys with args ${args}`, () => {
        const { generatedKeys, range } = generateKeys(...args);
        expect(generatedKeys).toEqual(expectedKeys);
        expect(range).toEqual(expectedRange);
      });
    });
  });

  // STRINGS DESCENDING
  describe('STRINGS DESCENDING', () => {
    const tests = [
      {args: [5, 'desc', 'string', [], true], expectedKeys: ['"e"', '"d"', '"c"', '"b"', '"a"'], expectedRange: ['"a"', '"e"']},
      {args: [5, 'desc', 'string', ["e"], true], expectedKeys: ['"d"', '"c"', '"b"', '"a"', '"Z"'], expectedRange: ['"Z"', '"d"']},
      {args: [4, 'desc', 'string', ["E"], true], expectedKeys: ['"D"', '"C"', '"B"', '"A"'], expectedRange: ['"A"', '"D"']},
      {args: [5, 'desc', 'string', ["E"], true], expectedKeys: ['"Dz"', '"Dy"', '"Dx"', '"Dw"', '"Dv"'], expectedRange: ['"Dv"', '"Dz"']},
      {args: [5, 'desc', 'string', ["AA", "A"], true], expectedKeys: ['"A"', '""', '""', '""', '""'], expectedRange: ['""', '"A"']},
      {args: [5, 'desc', 'string', ["AA", "A"], false], expectedKeys: ['"AAAz"', '"AAAy"', '"AAAx"', '"AAAw"', '"AAAv"'], expectedRange: ['"AAAv"', '"AAAz"']},
      {args: [5, 'desc', 'string', ["AA", "A", "x", "y ", "z"], true], expectedKeys: ['"w"', '"v"', '"u"', '"t"', '"s"'], expectedRange: ['"s"', '"w"']},
    ];

    tests.forEach(({args, expectedKeys, expectedRange}, index) => {
      test(`Test ${index + 1}: generates keys with args ${args}`, () => {
        const { generatedKeys, range } = generateKeys(...args);
        expect(generatedKeys).toEqual(expectedKeys);
        expect(range).toEqual(expectedRange);
      });
    });
  });


   // NUMBERS RANDOM 
   describe('NUMBERS RANDOM', () => {
    const randomTests = [
      {args: [9, 'random', 'number', [], true], expectedRange: [1, 9]},
      {args: [9, 'random', 'number', [0], true], expectedRange: [1, 9]},
      {args: [5, 'random', 'number', [4], true], expectedRange: [5, 9]},
      {args: [5, 'random', 'number', [-4.8], true], expectedRange: [-9, -5]},
      {args: [2, 'random', 'number', [4], false], expectedRange: [5, 9]},
      {args: [5, 'random', 'number', [4], false], expectedRange: [5, 99]},
      {args: [3, 'random', 'number', [5, 8], true], expectedRange: [5, 8]},
      {args: [3, 'random', 'number', [5, 5], true], expectedRange: [5, 5]},
      {args: [3, 'random', 'number', [1, 10], false], expectedRange: [1, 10]},
      {args: [3, 'random', 'number', [5, 10], false], expectedRange: [3, 12]},
      {args: [3, 'random', 'number', [5, 5], false], expectedRange: [0, 10]},
      {args: [3, 'random', 'number', [5, 6, 7, 9, 10], false], expectedRange: [0, 15]},
      {args: [3, 'random', 'number', [5, 5, 5, 5, 10], false], expectedRange: [0, 15]},
      {args: [3, 'random', 'number', [-2.8, -2, -1, 0, 1.2], false], expectedRange: [-8, 7]},
    ];

    randomTests.forEach(({args, expectedRange}, index) => {
      test(`Random Test ${index + 1}: ensures all generated keys are within the specified range with args ${args}`, () => {
        const { generatedKeys, range } = generateKeys(...args);
        expect(range).toEqual(expectedRange);
        generatedKeys.forEach(key => {
          expect(key).toBeGreaterThanOrEqual(expectedRange[0]);
          expect(key).toBeLessThanOrEqual(expectedRange[1]);
        });
      });
    });
  });


  // Strings RANDOM -
  describe('STRINGS RANDOM', () => {
    const randomTests = [
      {args: [25, 'random', 'string', [], true], expectedRange: ['"A"', '"z"']},
      {args: [26, 'random', 'string', [], true], expectedRange: ['"A"', '"zz"']},
      {args: [25, 'random', 'string', [], false], expectedRange: ['"A"', '"z"']},
      {args: [26, 'random', 'string', [], false], expectedRange: ['"A"', '"zz"']},
    ];
  
    randomTests.forEach(({args, expectedRange}, index) => {
      test(`Random Test ${index + 1}: ensures all generated keys are within the specified range with args ${args}`, () => {
        const { generatedKeys, range } = generateKeys(...args);
        // First, ensure the reported range is as expected
        expect(range).toEqual(expectedRange);
  
        // Then, check each generated key falls within the alphabetical range
        generatedKeys.forEach(key => {
          // Remove quotes for comparison
          const strippedKey = key.slice(1, -1);
          expect(strippedKey >= expectedRange[0].slice(1, -1) && strippedKey <= expectedRange[1].slice(1, -1)).toBeTruthy();
        });
      });
    });
  });
  

});