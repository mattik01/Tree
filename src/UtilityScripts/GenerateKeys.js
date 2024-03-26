// libraries
import Chance from "chance";

/**
 * The main function of this script is the generateKeys function, it is the only function that is supposed to be called from outside this script
 * The other functions are just uitlity.
 * The purpose of generateKeys is to return an array of n generated keys, such that they are in a sensible range, and fit the specification made
 * by the User on the input form.
 * IMPORTANT, before any computations outer quoutes surrounding string keys are usually removed. When returned as generatedKeys, they are reattached.
 */

/**
 * Generates n keys based on the order and type of the input. How they are generated and with what range is broadly indicated below.
 *
 *
 * ASC number: Range:[q (smallest natural number that is bigger than biggest existing key); q + n] Interval : 1     start with 0 if noexisting keys
 *
 * ASC string: Range: n times minimal lexicographical increment of the biggest existing key.    start with "" if no existing keys
 *
 * DESC number: smallest existing number decremented n times.                                   start with n if no existing keys
 *
 * DESC string: A string is infinitly decrementable, if it contains a letter that is not "A". Take the lexicographically smallest
 *              infinitely decrementable string, decrement it with the smallest possible lexicographical step, using just enough
 *              characters, so that possible decrements(using l characters at max) > n + existing keys. Do not decrement
 *              special characters, keep them at the same position as long as possible and eventually remove them. If no infinitly
 *              decrementable string exists, then append an "a" to the lexicographically smallest string, to make it infinitely
 *              decrementable. That is if duplicates are disabled, else, we will decrement up to "", and the "" over and over again.
 *                                                                                             start with "rane" if no existing keys
 * RANDOM number: random numbers between floor and ceiling
 *                  floor: no keys = 1, 1 key = the smallest existing key if positive, else smallest negative number 
 *                                              with the same amount of digits as (abs(floor) + n*2),
 *                           else: smallest key, if needed, lowered even further to get to desired range
 *                  ceiling: less than 2 keys = biggest number with the same amount of digits as (floor + n*2),
 *                           else = the biggest key, if needed increased, to further get to desired range
 * RANDOM string: random letter only strings between floor and ceiling
 *                  floor: "A"
 *                  ceiling: "z"s of length l, l is the smallest number, so that amount of possilble letters-only strings
 *                  of maximal length l > n + existing keys length, or the length of the longest existing key.(which-ever is bigger)
 *
 *
 *     IF A GENERATION STEP PRODUCES A DUPLICATE, AND DUPLICATES ARE DISABLED, JUST CONTINUE WITH THE NEXT STEP
 *
 * @param n - The number of keys to generate
 * @param order - The order of the keys ( asc|desc|random )
 * @param type - The type of the input ( number|string )
 * @param existingKeys - The already existing keys in an ordered ascending list
 * @param allowDuplicates - Whether duplicate keys are allowed in the output
 *
 * @return {generatedKeys, range} {[An Array holding the generated keys], [The range, that the generated keys span]}
 */
export default function generateKeys(
  n,
  order,
  type,
  existingKeys,
  allowDuplicates
) {
  let generatedKeys = [];
  let floor, ceiling;

  switch (order) {
    case "asc":
      if (type === "number") {
        // take the biggest existing number, increment n times from the next biggest natural number
        let biggestNatural =
          existingKeys.length === 0
            ? 0
            : Math.floor(existingKeys[existingKeys.length - 1]);
        for (let i = 0; i < n; i++) {
          generatedKeys[i] = biggestNatural + 1 + i;
        }
      } else if (type === "string") {
        if (existingKeys.length === 0) {
          generatedKeys = generateAscendingStrings(n, "");
        } else {
          generatedKeys = generateAscendingStrings(
            n,
            //existing key is alreay ordered, so biggest is just the last element
            existingKeys[existingKeys.length - 1]
          );
        }
      }

      floor = generatedKeys[0];
      ceiling = generatedKeys[n - 1];

      break;

    case "desc":
      if (type === "number") {
        // first element of existing key is the smallest
        let smallest =
          existingKeys.length === 0 ? n + 1 : Math.ceil(existingKeys[0]);
        // since all number can be incremented inifinietly. just decrement from n+1 or the smallest existing key. n times
        for (let i = 0; i < n; i++) {
          generatedKeys[i] = smallest - 1 - i;
        }
      } else if (type === "string") {
        if (existingKeys.length == 0) {
          // if no existings keys, start with begin by decrementing "rand"
          generatedKeys = generateDescendingStrings(n, generateAscendingStrings(n,'"a"')[n-1]);
        } else {
          // put existing keys that could be smaller than our biggest generated key in here, to avoid duplicates
          let potentialDuplicates = [];
          let i = indexSmallestDecrementableString(existingKeys);
          if (i == null) {
            // this means no infinitly decrementable string exists
            let smallestInfiniteIncrement = existingKeys[0];
            if (!allowDuplicates) {
              // Add all existing keys, to potential duplicates, that are smaller than smallestString + "B".
              smallestInfiniteIncrement = `${removeOuterQuotes(existingKeys[0])}B`;

              for (let i = 0; i < existingKeys.length; i++) {
                if (existingKeys[i] >= smallestInfiniteIncrement) {
                  break;
                }
                potentialDuplicates.push(existingKeys[i]);
              }
            }
            // generate n + potential duplicates.length keys, later, slice off all extra keys.
            generatedKeys = generateDescendingStrings(
              n + potentialDuplicates.length,
              smallestInfiniteIncrement
            );
          } else {
            // this meand infinitley decrementable string exists.
            if (!allowDuplicates) {
              // add all smaller existing keys to potential duplicates.
              potentialDuplicates = potentialDuplicates.concat(
                existingKeys.slice(0, i)
              );
            }
            // generate n + potential duplicates.length keys, later, slice off all extra keys.
            generatedKeys = generateDescendingStrings(
              n + potentialDuplicates.length,
              existingKeys[i]
            );
          }
          if (!allowDuplicates) {
            // remove all generated duplicate keys
            generatedKeys = generatedKeys.filter(
              (key) => !potentialDuplicates.includes(key)
            );
          }
          //if we still generated too many keys, discard the rest
          generatedKeys = generatedKeys.slice(0, n);
        }
      }
      floor = generatedKeys[n - 1];
      ceiling = generatedKeys[0];
      break;

    case "random":
      // floor and ceiling defined in a way, so that the chance of generating a duplicate is always <= 50%

      if (type === "number") {
        if (existingKeys.length === 0) {
          floor = 1;
          ceiling = liftCeilingNumber(n * (allowDuplicates? 1 : 2));
        } else if (existingKeys.length === 1) {
          floor = Math.floor(Math.abs(existingKeys[0] + 1));
          ceiling = liftCeilingNumber(Math.floor(Math.abs(existingKeys[0]))+ n * (allowDuplicates? 1 : 2));
          if (existingKeys[0] < 0) {
            // for a negative key, produce a negative range
            floor = -ceiling;
            ceiling = -Math.floor(Math.abs(existingKeys[0] - 1));
          }
        } else {
          floor = Math.sign(existingKeys[0]) * Math.ceil(Math.abs(existingKeys[0]));
          ceiling = Math.sign(existingKeys[existingKeys.length-1]) * Math.ceil(Math.abs(existingKeys[existingKeys.length - 1]));
          //if range is not wide enough extend it on both ends
          let missingRange = (n + existingKeys.length) * 2 - (ceiling - floor + 1);
          if (missingRange > 0 && !allowDuplicates) {
            floor -= Math.ceil(missingRange / 2);
            ceiling += Math.ceil(missingRange / 2);
          }
        }

        // use floor and ceiling to generate keys
        for (let i = 0; i < n; i++) {
          let key;
          do {
            key = getRandomNumber(floor, ceiling);
          } while (
            !allowDuplicates && 
            (existingKeys.includes(key) || generatedKeys.includes(key))
          );
          generatedKeys[i] = key;
        }
      } else if (type === "string") {
        // figure out max length of random string for appropriate key space
        const maxLength = requiredStringLength(n, existingKeys);
        for (let i = 0; i < n; i++) {
          let key;
          do {
            key = randomString(maxLength);
            //regenerate if the key already exists
          } while (
            !allowDuplicates &&
            (existingKeys.includes(key) || generatedKeys.includes(key))
          );
          generatedKeys[i] = key;
        }
        floor = '"A"';
        ceiling = '"' + "z".repeat(maxLength) + '"';
      }

      break;
  }
  return { generatedKeys: generatedKeys, range: [floor, ceiling] };
}

//-----  UTILITY FUNCTIONS --------

const N_LETTERS = 52;
const chance = new Chance();

/**
 * Recall, for our keys, it is advised that they are surounded by quotes, if actually intended as strings. This function strips such outer quotes from strings.
 * @param string - The string to remove outer quotes from
 * @return { string } The string without outer quotes, if outerquotes were present
 */
function removeOuterQuotes(string) {
  if (string.startsWith('"') && string.endsWith('"')) {
    string = string.slice(1, -1);
  }
  return string;
}

/**
 * Checks if a string is a letter.
 * @param char - The string to check.
 * @return { boolean } True if the string is just one character and is a letter
 */
function isLetter(char) {
  return /[a-zA-Z]/.test(char);
}

/**
 * Increments a letter lexicographically
 * @param char - The letter to increment
 * @throws Error, if we try to increment a "z", since it is the lexicographically biggest letter,
 *         Also error if we try to increment a special character.
 * @return {String} the incremented letter
 */
function incrementLetter(letter) {
  if (isLetter(letter)) {
    const charCode = letter.charCodeAt(0);
    if (letter == "Z") {
      // If the letter is 'Z', wrap around to 'a'
      return "a";
    } else if (letter == "z") {
      throw new Error("tried to increment " + letter);
    } else {
      // Increment the letter by 1
      return String.fromCharCode(charCode + 1);
    }
  } else {
    //not a letter
    throw new Error("tried to increment " + letter);
  }
}
/**
 * Decrements a letter lexicographically
 * @param char - The letter to decrement
 * @throws Error, if we try to increment a "A", since it is the lexicographically smallest letter
 *         Also error if we try to decrement a special character.
 * @return {String} the decremented letter
 */
function decrementLetter(letter) {
  if (isLetter(letter)) {
    const charCode = letter.charCodeAt(0);
    if (letter == "a") {
      // If the letter is 'a', wrap around to 'Z'
      return "Z";
    } else if (letter == "A") {
      throw new Error("tried to decrement " + letter);
    } else {
      // Decrement the letter by 1
      return String.fromCharCode(charCode - 1);
    }
  } else {
    //not a letter
    throw new Error("tried to decrement " + letter);
  }
}

/**
 * @return {Boolean} Indicating if a letter is upercase
 */
function isUppercase(char) {
  return char === char.toUpperCase() && char !== char.toLowerCase();
}
/**
 *  determines how often you can increment a single char, until it becomes 'z'
 *   null means "free digit" and will return n Letters (52) in our alphabet
 * @return {number} incrementability of a single char
 */
function getCharIncrementability(char) {
  if (char == null) {
    return N_LETTERS;
  }

  if (isLetter(char)) {
    if (isUppercase(char)) {
      return "Z".charCodeAt(0) - char.charCodeAt(0) + 26; // +lowecase increments
    } else {
      return "z".charCodeAt(0) - char.charCodeAt(0);
    }
  }
  return 0;
}

/**
 *  determines how often you can decrement a single char, until it becomes 'A'
 *   null means "free digit" and will return n Letters (52) in our alphabet
 * @return {number} decrementability of a single char
 */
function getCharDecrementability(char) {
  if (char === null) {
    return N_LETTERS;
  }

  if (isLetter(char)) {
    if (isUppercase(char)) {
      return char.charCodeAt(0) - "A".charCodeAt(0);
    } else {
      return char.charCodeAt(0) - "a".charCodeAt(0) + 26; // +lowercase decrements
    }
  }
  return 0;
}
/**
 *  calculate the "keyspace" (how many permuations, of letter-only string of maximal length(digits) are possible,
 *  that are lexicographically bigger than the passed string
 *  This is meant for usage in the ascending generation algorithm, and differs from the descending implementation.
 * @param string the string, that all string in the keyspace must be lexicographically bigger than,
 * @param digits, the max amount of digits allowed for the keyspace
 */
function getKeySpaceAscendingForDigits(string, digits) {
  string = string.split("");

  const charArray = Array(digits).fill(null);
  for (let i = 0; i < Math.min(string.length, digits); i++) {
    charArray[i] = string[i];
  }
  let keySpace = 0;

  //trailing nulls mean free digits, free keySpace, without touching original string
  const nullCount = charArray.reduce(
    (count, value) => count + (value === null ? 1 : 0),
    0
  );
  if (nullCount > 0) {
    keySpace += Math.pow(N_LETTERS, nullCount);
  }

  //more keySpace by incrementing the chars of the original string
  for (let i = charArray.length - 1; i >= 0; i--) {
    if (charArray[i] != null && isLetter(charArray[i])) {
      //after incrementing a character, all digits after (not special characters) become free
      const FreeDigitsArray = charArray
        .slice(i + 1)
        .filter((char) => char === null || isLetter(char));
      keySpace +=
        getCharIncrementability(charArray[i]) *
        Math.pow(N_LETTERS, FreeDigitsArray.length);
    }
  }
  return keySpace;
}

/**
 *  calculate the "keyspace" (how many permuations, of letter-only string of maximal length(digits) are possible,
 *  that are lexicographically smaller than the passed string
 *  This is meant for usage in the descending generation algorithm, and differs from the ascending implementation.
 * @param string the string, that all string in the keyspace must be lexicographically smaller than,
 * @param digits, the max amount of digits allowed for the keyspace
 */
function getKeySpaceDescendingForDigits(string, digits) {
  const charArray = Array(digits).fill(null);
  for (let i = 0; i < Math.min(string.length, digits); i++) {
    charArray[i] = string[i];
  }
  let keySpace = 0;

  //If string is longer than digit array, the prefix of length digits is one additional possible smaller key
  if (string.length > digits) {
    keySpace++;
    console.log(+1)
  }

  //more keySpace by decrementing the chars of the original string
  for (let i = 0; i < charArray.length; i++) {
    if (charArray[i] != null && isLetter(charArray[i]) && charArray[i] != "A") {
      //after decrementing a character, all digits after are free
      keySpace +=
        getCharDecrementability(charArray[i]) *
        Math.pow(N_LETTERS, digits - i - 1);
    }
  }

  return keySpace;
}

/**
 * Determines the max amount of digits our ascending string generation algorithm needs at the very least,
 * for perfroming n lexicographically optimal increments
 * @param n, the amount of lexixographically optimal increments that should be performed.
 * @param string the string, that all strings in the "keyspace" must be lexicographically bigger than,
 */
function determineMaxDigitsAscending(n, string) {
  let digits = 0;
  let keySpace = 0;
  while (keySpace < n) {
    digits++;
    keySpace += getKeySpaceAscendingForDigits(string, digits);
  }
  return digits;
}

/**
 * Determines the max amount of digits our descending string generation algorithm needs at the very least,
 * for perfroming n lexicographically optimal decrements
 * @param n, the amount of lexixographically optimal decrements that should be performed.
 * @param string the string, that all strings in the "keyspace" must be lexicographically smaller than,
 */
function determineMaxDigitsDescending(n, string) {
  let digits = 0;
  let keySpace = 1; //last "A" can always be removed decremented to the empty string
  while (keySpace <= n) {
    digits++;
    keySpace += getKeySpaceDescendingForDigits(string, digits);
  }
  return digits;
}

/**
 * Find the last letter in a char array, that is still incrementable (not "z")
 */
function findLastIncrementableLetterIndex(charArray) {
  for (let i = charArray.length - 1; i >= 0; i--) {
    const char = charArray[i];
    if (isLetter(char) && char != "z") {
      return i;
    }
  }
  return null; // Return null if no incrementable letter is found in the array.
}

/**
 * Takes a string in form of a charArray, and increments it in a lexicographically optimal way.
 * null values within that char array, are considered free digits, as in not currently used, but could be filled with a letter.
 * @param charArray Array of chars, and possibly trailing null values, represintig a string and the max allowed digits.
 * @returns the charArray incremented lexicographically, possibly with trailing nulls, represinting "free digits"
 */
function incrementCharArray(charArray) {
  const charArrayCpy = charArray.slice();
  const firstNullIndex = charArrayCpy.indexOf(null);

  if (firstNullIndex !== -1) {
    // free digit(s) detected, replace by 'A'
    charArrayCpy[firstNullIndex] = "A";
    return charArrayCpy;
  } else {
    //find the first incrementable letter from the right,...
    let lastIncrementableLetterIndex =
      findLastIncrementableLetterIndex(charArrayCpy);

    if (lastIncrementableLetterIndex == null) {
      // this should not occour if maxDigits was calculated correctly and charrArray is of length maxDigits
      return charArrayCpy;
    } else {
      //... increment it and make all symbols that come after free (null)
      charArrayCpy[lastIncrementableLetterIndex] = incrementLetter(
        charArrayCpy[lastIncrementableLetterIndex]
      );
      for (
        let i = lastIncrementableLetterIndex + 1;
        i < charArrayCpy.length;
        i++
      ) {
          charArrayCpy[i] = null;
      }
      return charArrayCpy;
    }
  }
}

/**
 * Takes a string in form of a charArray, and decrements it in a lexicographically optimal way.
 * null values within that char array, are considered free digits, as in not currently used, but could be filled with a letter.
 * @param charArray Array of chars, and possibly trailing null values, represintig a string and the max allowed digits.
 * @returns the charArray decremented lexicographically, possibly with trailing nulls, represinting "free digits"
 */
function decrementCharArray(charArray) {
  let charArrayCpy = charArray.slice();

  for (let i = charArrayCpy.length -1; i >= 0; i--) {
    if (charArrayCpy[i] != null) {
      if (isLetter(charArrayCpy[i]) && charArrayCpy[i] != "A") {
        // decrement letter, set all after to maxiaml letter (z)
        charArrayCpy[i] = decrementLetter(charArrayCpy[i]);
        charArrayCpy = charArrayCpy.map((x) => (x == null ? "z" : x));
        return charArrayCpy;
      } else {
        // last character is special char or 'A'... just pop it
        charArrayCpy[i] = null;
      }
      return charArrayCpy;
    }
  }
  //everything was null, there is nothing to decrement
  return charArrayCpy;
}

/**
 * Takes a string and returns a list of the same string incremented optimally n times
 * @param n, the amount of ascending strings generated
 * @param string the string you want to increment
 * @returns {Array} of lexicographically ascending strings
 */
function generateAscendingStrings(n, string) {
  if (n <= 0) {
    return string;
  }

  string = removeOuterQuotes(string);

  //minimum required string length for n increments
  const maxDigits = determineMaxDigitsAscending(n, string);

  const incrementedStringArrays = new Array(n);

  //increment will require a char array, trailing nulls signify usable (free) digits
  string = string.split("");
  const charArray = Array(maxDigits).fill(null);
  for (let i = 0; i < Math.min(maxDigits, string.length); i++) {
    charArray[i] = string[i];
  }

  // create the first incremented string
  incrementedStringArrays[0] = incrementCharArray(charArray);

  // create all other string increments, based on increment that came before them, side effect: rebuild the char arrays into strings.
  for (let i = 1; i < n; i++) {
    incrementedStringArrays[i] = incrementCharArray(
      incrementedStringArrays[i - 1]
    );
    //last entries(not used anyomore converted from char arrays to strings)
    incrementedStringArrays[i - 1] =
      '"' +
      incrementedStringArrays[i - 1].filter((char) => char !== null).join("") +
      '"';
  }
  incrementedStringArrays[incrementedStringArrays.length - 1] =
    '"' +
    incrementedStringArrays[incrementedStringArrays.length - 1]
      .filter((char) => char !== null)
      .join("") +
    '"';
  return incrementedStringArrays;
}

/**
 * Takes a string and returns a list of the same string decremented optimally n times
 * @param n, the amount of ascending strings generated
 * @param string the string you want to increment
 * @returns {Array} of lexicographically descending strings
 */
function generateDescendingStrings(n, string) {
  if (n <= 0) {
    return string;
  }

  string = removeOuterQuotes(string).split("");
  const decrementedStringArrays = new Array(n);

  //find out if the passed string is endlessly decrementable,
  let endlessDecrementable = false;
  for (let i = 0; i < string.length; i++) {
    if (isLetter(string[i]) && string[i] != "A") {
      endlessDecrementable = true;
    }
  }

  //if it is not endlessly decrementable (Just Special characters or "A"), decrement it n times by dropping the last char.
  // ("" not further decrementable, will just be replicated)
  if (!endlessDecrementable) {
    for (let i = 0; i < n; i++) {
      if (string.length > 0) {
        string.pop();
      }
      decrementedStringArrays[i] = '"' + string.join("") + '"';
    }
    return decrementedStringArrays;
  }

  // string is infinietly decrementable:

  //minimum required string length for n decrements
  const maxDigits = determineMaxDigitsDescending(n, string);

  //decrement will require a char array, nulls signify usable (free) digits
  const charArray = Array(maxDigits).fill(null);
  for (let i = 0; i < Math.min(maxDigits, string.length); i++) {
    charArray[i] = string[i];
  }

  //perform the first decrement
  decrementedStringArrays[0] = decrementCharArray(charArray);

  // create all other string decrements, based on decrement that came before them, side effect: rebuild the char arrays into strings.
  for (let i = 1; i < n; i++) {
    decrementedStringArrays[i] = decrementCharArray(
      decrementedStringArrays[i - 1]
    );
    //not used anyomore entries converted from char arrays to strings
    decrementedStringArrays[i - 1] =
      '"' +
      decrementedStringArrays[i - 1].filter((char) => char !== null).join("") +
      '"';
  }
  decrementedStringArrays[decrementedStringArrays.length - 1] =
    '"' +
    decrementedStringArrays[decrementedStringArrays.length - 1]
      .filter((char) => char !== null)
      .join("") +
    '"';

  return decrementedStringArrays;
}


/**
 * This function finds the smallest infenitly decrementable string (not "" not "A") in an lexicographically ordered list of strings
 * @param strings - lexicograhpically ordered ascending list of strings to search
 * @return { number|null } The index of the lexicographically smallest, but still infenitely decrementable string present in the array
 */
function indexSmallestDecrementableString(strings) {
  let i = 0;
  while (i < strings.length) {
    const string = removeOuterQuotes(strings[i]);
    for (let j = 0; j < string.length; j++) {
      // a string is infinitely lexicographically decrementable, if it contains a letter that is not "A"
      if (isLetter(string[j]) && string[j] != "A") {
        return i;
      }
      i++;
    }
  }
  return null;
}

/**
 * @param strings - The list of strings to check
 *
 * @return { number } The longest string length in the list
 */
function findLongestStringLength(strings) {
  return Math.max(...strings.map((key) => countDigits(key)));
}

/**
 * Counts the digits/chars in a number or a string. For strings, we remove the outer quotes; for numbers, we remove the sign and decimal point.
 *
 * @param value - The number/string to count the digits/chars in.
 *
 * @return {Number} The number of digits/chars in the number or string.
 */
function countDigits(value) {
  let str;

  if (typeof value === "number") {
    // Remove sign and decimal point for counting the digits
    str = String(value).replace(/[-.]/g, "");
  } else {
    str = removeOuterQuotes(value);
  }

  // Count the digits in the string
  const digitCount = str.length;
  return digitCount;
}

/**
* Given a the existing keys and amount of new string keys that need to be generated. This functions determines,
  how many digits the string generator should be allowed to use, so that there are at least 2x as many new and unique posssible strings
  than how many are actually required (n)
* 
* @param n - The number of new strings we want to generate
* @param existingKeys - the list of already existing string keys.
* 
* @return { number } max(the longest existing string length, least required string length, the string generator should be allowed to use)
*/
function requiredStringLength(n, existingKeys) {
  let keyspace = 0;
  let digitLength = 0;
  while (keyspace <= 2 * (n + existingKeys.length)) {
    digitLength++;
    // A-z = 52, can form 52^digit length strings of length digit length
    keyspace += Math.pow(52, digitLength);
  }
  //use the biggest string as max digit length, if it is long enough
  if (existingKeys.length > 0) {
    return Math.max(digitLength, findLongestStringLength(existingKeys));
  }
  return digitLength;
}

/**
 * Increases any natural number to the maximum number with the she same amount of digits
 * @param number - The natural number to increase.
 * @return { number } the biggest natural number, that has the same amount of digits
 */
function liftCeilingNumber(number) {
  if (number < 0) {
    return Math.pow(10, countDigits(number) - 1) * -1;
  } else {
    return Math.pow(10, countDigits(number)) - 1;
  }
}

/**
 * @return { number } random number in the range, including floor and ceiling
 */
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomWeightedNumber(min, max) {
  const powersOf52 = Array.from({ length: max - min + 1 }, (_, i) => 52 ** (i + min));
  const totalTickets = powersOf52.reduce((acc, val) => acc + val, 0);
  const randomIndex = Math.floor(Math.random() * totalTickets);

  let cumulativeSum = 0;
  for (let i = 0; i < powersOf52.length; i++) {
    cumulativeSum += powersOf52[i];
    if (randomIndex < cumulativeSum) {
      return i + min;
    }
  }
}


/**
 * @return { String } A random letters-only String, that is at least 1 and at most maxLength characters long.
 */
function randomString(maxlength) {
  return (
    '"' +
    chance.string({
      length: getRandomWeightedNumber(1, maxlength),
      pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXZZ",
    }) +
    '"'
  );
}
