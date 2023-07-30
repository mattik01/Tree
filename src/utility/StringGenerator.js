import Chance from 'chance';

const N_LETTERS = 52

function isLetter(char) {
    return /[a-zA-Z]/.test(char);
  }

function incrementLetter(letter) {
    if(isLetter(letter)){
        const charCode = letter.charCodeAt(0);
        if (letter == 'Z') {
        // If the letter is 'Z', wrap around to 'a'
        return 'a';
        } else if (letter == 'z'){
            throw new Error("tried to increment " + letter);
        }
        else{
        // Increment the letter by 1
        return String.fromCharCode(charCode + 1);
        }
    }
    else{
        //not a letter
        throw new Error("tried to increment " + letter);
    }
}

function decrementLetter(letter) {
    if(isLetter(letter)){
        const charCode = letter.charCodeAt(0);
        if (letter == 'a') {
        // If the letter is 'a', wrap around to 'Z'
        return 'Z';
        } else if (letter == 'A'){
            throw new Error("tried to increment " + letter);
        }
        else{
        // Decrement the letter by 1
        return String.fromCharCode(charCode - 1);
        }
    }
    else{
        //not a letter
        throw new Error("tried to increment " + letter);
    }
}


function isUppercase(char) {
return char === char.toUpperCase() && char !== char.toLowerCase();
}

function removeOuterQuotes(string){
    if (string.startsWith('"') && string.endsWith('"')) {
        string = string.slice(1, -1);
      }
      return string
}


// determines how often you can increment a char, until it becomes 'z'
// null means free digit and will return nLetters (52) in our alphabet
function getCharIncrementability(char){
    if(char == null){
        return N_LETTERS
    }

    if(isLetter(char)){
        if(isUppercase(char)){
        return 'Z'.charCodeAt(0) - char.charCodeAt(0) + 26 // +lowecase increments
        }
        else{
        return 'z'.charCodeAt(0) - char.charCodeAt(0)
        }
    }
    return 0
}

// determines how often you can increment a char, until it becomes 'z'
// null means free digit and will return nLetters (52) in our alphabet
function getCharDecrementability(char) {
    if (char === null) {
      return N_LETTERS;
    }
  
    if (isLetter(char)) {
      if (isUppercase(char)) {
        return char.charCodeAt(0) - 'A'.charCodeAt(0); 
      } else {
        return char.charCodeAt(0) - 'a'.charCodeAt(0) + 26; // +lowercase decrements
      }
    }
  
    return 0;
  }

function getKeySpaceAscendingForDigits(string, digits){
    string = string.split("")

    const charArray = Array(digits).fill(null);
    for(let i = 0; i < Math.min(string.length, digits); i++){
        charArray[i] = string[i]
    }
    let keySpace = 0

    //trailing nulls mean free digits, free keySpace, without touching original string
    const nullCount = charArray.reduce((count, value) => count + (value === null ? 1 : 0), 0);
    if(nullCount > 0){
        keySpace += (Math.pow(N_LETTERS, nullCount))
    }

    //more keySpace by incrementing the chars of the original string
    for(let i = charArray.length -1; i >= 0; i--){
        if(charArray[i] != null && isLetter(charArray[i])){
        //after incrementing a character, all digits after (not special characters) become free
        const FreeDigitsArray = charArray.slice(i + 1).filter((char) => char === null || isLetter(char))
        keySpace += getCharIncrementability(charArray[i]) * Math.pow(N_LETTERS, FreeDigitsArray.length)
        }
    }

    return keySpace
}

function getKeySpaceDescendingForDigits(string, digits){

    const charArray = Array(digits).fill(null);
    for(let i = 0; i < Math.min(string.length, digits); i++){
        charArray[i] = string[i]
    }
    let keySpace = 0

    //If string is longer than digit array, the prefix is one possible smaller key
    if(string.length > digits.length){
        keySpace++
    }

    //more keySpace by decrementing the chars of the original string
    for(let i = 0; i < charArray.length; i++){
        if(charArray[i] != null && isLetter(charArray[i]) && charArray[i] != 'A'){
        //after decrementing a character, all digits after are free
        keySpace += getCharDecrementability(charArray[i]) * Math.pow(N_LETTERS, charArray.length - i -1) 
        }
    }

    return keySpace
}


function determineMaxDigitsAscending(n, string){
    let digits = 0
    let keySpace = 0
    while(keySpace < n){
        digits++
        keySpace += getKeySpaceAscendingForDigits(string, digits)
    }
    return Math.max(digits, string.length)
}

function determineMaxDigitsDescending(n ,string){
    let digits = 0
    let keySpace = 1 //last a can always be removed
    while(keySpace < n){
        digits++
        keySpace += getKeySpaceDescendingForDigits(string, digits)
    }
    return Math.max(digits, string.length)
}


function findLastIncrementableLetterIndex(charArray) {
    for (let i = charArray.length - 1; i >= 0; i--) {
      const char = charArray[i];
      if (isLetter(char) && char != 'z') {
        return i;
      }
    }
    return null// Return null if no letter is found in the array.
  }


//takes a char array (to preserve original position of special characters in all cases)
function incrementCharArray(charArray){
    const charArrayCpy =charArray.slice()
    const firstNullIndex = charArrayCpy.indexOf(null);

    if (firstNullIndex !== -1) {
        // free digit(s) detected, replace by 'A'
        charArrayCpy[firstNullIndex] = 'A';
        return charArrayCpy
    }
    else{
        //find the first incrementable letter from the right,...
        let lastIncrementableLetterIndex = findLastIncrementableLetterIndex(charArrayCpy)

        if(lastIncrementableLetterIndex == null){
            // this should not occour if maxDigits was calculated correctly and charrArray is of length maxDigits
            return charArrayCpy
        }
        else{
            //... increment it and make all letters that come after free (null)
            charArrayCpy[lastIncrementableLetterIndex] = incrementLetter(charArrayCpy[lastIncrementableLetterIndex])
            for(let i = lastIncrementableLetterIndex +1; i < charArrayCpy.length; i++){
              if(isLetter(charArrayCpy[i])){
                charArrayCpy[i] = null
              }
            }
            return charArrayCpy
        }
    }
}

function decrementCharArray(charArray){
      let charArrayCpy =charArray.slice()

      for(let i = charArrayCpy.length -1; i >= 0; i--){
        if(charArrayCpy[i] != null){
            if(isLetter(charArrayCpy[i]) && charArrayCpy[i] != "A" ){
                // decrement letter, set all after to maxiaml letter (z)
                charArrayCpy[i] = decrementLetter(charArrayCpy[i])
                charArrayCpy = charArrayCpy.map(x => x == null? 'z' : x)
                return charArrayCpy
            }
            else{
                // last character is special char or 'A'... just pop it
                charArrayCpy[i] = null
            }
            return charArrayCpy
        }
      }
      //everything was null, there is nothing to decrement
      return charArrayCpy
  }


export function generateAscendingStrings(n, string){
    if(n <= 0){
        return string
    }

    string = removeOuterQuotes(string)
    
    //minimum required string length for n increments
    const maxDigits = determineMaxDigitsAscending(n, string)

    const incrementedStringArrays = new Array(n)

    //increment will require a char array, nulls signify usable (free) digits
    string = string.split("")
    const charArray = Array(maxDigits).fill(null);
    for(let i = 0; i < Math.min(maxDigits, string.length); i++){
        charArray[i] = string[i]
    }
    
    incrementedStringArrays[0] = incrementCharArray(charArray)

    for(let i = 1; i < n; i++){
        incrementedStringArrays[i] = incrementCharArray(incrementedStringArrays[i -1])
        //last entries(not used anyomore converted from char arrays to strings)
        incrementedStringArrays[i -1] = '"' + incrementedStringArrays[i-1].filter((char) => char !== null).join('') + '"'    
    }
    incrementedStringArrays[incrementedStringArrays.length -1] = '"' + 
        incrementedStringArrays[incrementedStringArrays.length -1].filter((char) => char !== null).join('')
        + '"'

    return incrementedStringArrays
}



//decrement a string by lexicographically, may receive and will return the string in quotes
export function generateDescendingStrings(n, string){
    if(n <= 0){
        return string
    }

    string = removeOuterQuotes(string).split("")
    const decrementedStringArrays = new Array(n)

    let endlessDecrementable = false
    for(let i = 0; i < string.length; i++){
        if(isLetter(string[i]) && string[i] != 'A'){
            endlessDecrementable = true
        }
    }

    if(!endlessDecrementable){
        for(let i = 0; i < n; i++){
            if(string.length > 0){
                string.pop()
            }
            decrementedStringArrays[i] = '"' + string.join("") + '"'
        }
        return decrementedStringArrays
    }
    
    //minimum required string length for n decrements
    const maxDigits = determineMaxDigitsDescending(n, string)

    //decrement will require a char array, nulls signify usable (free) digits
    const charArray = Array(maxDigits).fill(null);
    for(let i = 0; i < Math.min(maxDigits, string.length); i++){
        charArray[i] = string[i]
    }
    
    decrementedStringArrays[0] = decrementCharArray(charArray)

    for(let i = 1; i < n; i++){
        decrementedStringArrays[i] = decrementCharArray(decrementedStringArrays[i -1])
        //not used anyomore entries converted from char arrays to strings
        decrementedStringArrays[i -1] = '"' + decrementedStringArrays[i-1].filter((char) => char !== null).join('') + '"'    
    }
    decrementedStringArrays[decrementedStringArrays.length -1] = '"' + 
    decrementedStringArrays[decrementedStringArrays.length -1].filter((char) => char !== null).join('')
        + '"'

    return decrementedStringArrays
}



function getRandomNumber(min, max) {
    var range = max - min + 1;
    var randomNumber = Math.floor(Math.random() * range) + min;
    return randomNumber;
    }

    
const chance = new Chance();
export function randomString(maxlength){
    return '"' + chance.string({ length: getRandomNumber(1,maxlength), pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXZZ' }) + '"';
}
