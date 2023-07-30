import {generateAscendingStrings, generateDescendingStrings, randomString} from "./StringGenerator";

function removeOuterQuotes(string){
  if (string.startsWith('"') && string.endsWith('"')) {
      string = string.slice(1, -1);
    }
    return string
}


function isLetter(char) {
  return /[a-zA-Z]/.test(char);
}

function indexSmallestDecrementableString(strings){
  
  let i = 0
  while(i < strings.length){
    const key = removeOuterQuotes(strings[i])
    if(isLetter(key) && key != 'A'){
      return i
    }
    i++
  }
  return null
}

function findBiggestString(strings) {
  return strings.reduce((biggestString, currentString) =>
    currentString > biggestString ? currentString : biggestString
  );
}

function findLongestStringLength(strings){

  return Math.max(...strings.map(key => countDigits(key)))
}

function countDigits(value) {
  // Convert the number to a string representation
  let str
  if(typeof value === 'number'){
    //remove sign for counting the digits
    str = String(value).replace('-', '');
  }else{
    str = removeOuterQuotes(value)
  }

  // Count the digits in the string
  const digitCount = str.length;
  return digitCount;
}

function requiredStringLength(n, existingKeys){
  let keyspace = 0
  let digitLength = 0
  while(keyspace <= 2*(n + existingKeys.length)){
    digitLength++
    // A-z = 52, can form 52^digit length strings of length digit length
    keyspace += Math.pow(52,digitLength)
  }
  //use use the biggest string as max digit length, if it i long enough
  if(existingKeys.length > 0){
  return Math.max(digitLength, findLongestStringLength(existingKeys))
  }
  return digitLength
}

function liftCeilingNumber(number){   
  if(number < 0){
    return Math.pow(10, countDigits(number) - 1) * -1
  }
  else{
    return Math.pow(10, countDigits(number)) - 1
  }
}

function getRandomNumber(min, max) {
    var range = max - min + 1;
    var randomNumber = Math.floor(Math.random() * range) + min;
    return randomNumber;
  }
  
  export default function generateKeys(n, order, type, existingKeys, allowDuplicates) {
    let generatedKeys = [];
    let floor, ceiling

    switch (order) {
      case "asc":
        if (type === "number") {
          let biggest = existingKeys.length === 0 ? 0 : Math.max(...existingKeys);
          for (let i = 0; i < n; i++) {
            generatedKeys[i] = biggest + 1 + i;
          }

        
        } else if (type === "string") {
          if(existingKeys.length === 0){
            generatedKeys = generateAscendingStrings(n, "")
          }
          else{
            generatedKeys = generateAscendingStrings(n, findBiggestString(existingKeys))
          }
        }

        floor = generatedKeys[0]
        ceiling = generatedKeys[n-1]

        break;
  
      case "desc":
        if (type === "number") {
          let smallest = existingKeys.length === 0 ? n + 1 : Math.min(...existingKeys);
          for (let i = 0; i < n; i++) {
            generatedKeys[i] = smallest - 1 - i;
          }
        } else if (type === "string") {
            if(existingKeys.length == 0){      
              generatedKeys = generateDescendingStrings(n, '"rane"')
            }
            else{
                let potentialDuplicates = []
                let i = indexSmallestDecrementableString(existingKeys)
                if(i == null){
                  //no key exists, that is infinitely decrementable, create one, by appending a 'a'
                  if(!allowDuplicates){
                    potentialDuplicates = potentialDuplicates.concat(existingKeys)
                  }
                  generatedKeys = generateDescendingStrings(n + potentialDuplicates.length, allowDuplicates ? existingKeys[0] : `"${removeOuterQuotes(existingKeys[0]) + "a"}"`)
                }
                else{
                  if(!allowDuplicates){
                    potentialDuplicates = potentialDuplicates.concat(existingKeys.slice(0, i))
                  }
                  generatedKeys = generateDescendingStrings(n + potentialDuplicates.length, existingKeys[i])
                }
                if(!allowDuplicates){
                  //filter key already existing in the tree
                  generatedKeys = generatedKeys.filter((key) => !potentialDuplicates.includes(key));
                }
                //if we still generated too many keys, discard the rest
                generatedKeys = generatedKeys.slice(0, n)
          }
        }
        floor = generatedKeys[n-1]
        ceiling = generatedKeys[0]
        break;
        
      case "random":
        if (type === "number") {
  
          if (existingKeys.length === 0) {
            floor = 1;
            ceiling = liftCeilingNumber(floor + n * 2);
          } else if (existingKeys.length === 1) {
            floor = existingKeys[0];
            ceiling = liftCeilingNumber(floor + n * 2);
          } else {
            floor = Math.min(...existingKeys);
            ceiling = Math.max(floor + (n + existingKeys.length)*2, ...existingKeys)
          }
  
          for (let i = 0; i < n; i++) {
            let key;
            do {
              key = getRandomNumber(floor, ceiling);
            } while (!allowDuplicates && (existingKeys.includes(key) || generatedKeys.includes(key)));
            generatedKeys[i] = key;
          }


        } else if (type === "string") {
          // figure out max length of random string for appropriate key space
          const maxLength = requiredStringLength(n, existingKeys)
          for (let i = 0; i < n; i++) {
            let key
            do{
            key = randomString(maxLength)
            //regenerate if the key already exists
            } while(!allowDuplicates && (existingKeys.includes(key)  || generatedKeys.includes(key)))
            generatedKeys[i] = key
          }
          floor = "A"
          ceiling = "z".repeat(maxLength);
        }

        break;
    }
    return {generatedKeys : generatedKeys, 
            range : [floor, ceiling]};
  }
  