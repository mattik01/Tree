/**
 * This function randomizes the position of elements in an array using the Fisher-Yates/Knuth shuffle algorithm 
* @param array - The array to shuffle.
* @return { Array } The shuffled array.
*/
export default function shuffleArray(array) {
  // Randomly randomizes the array.
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
