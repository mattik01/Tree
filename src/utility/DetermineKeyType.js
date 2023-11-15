/**
 * All user inputs for keys are received as strings. This functions returns how they should be interpreted
 * -> anything surrounded with quotes is always interpreted as string
 * -> if it can be interpreted as a number do so
 * -> else interpret it as string
* @param keyString - The key string that should be examined
* @return { "string"|"number" } Either "string" or "number"
*/
export default function determineKeyStringType(keyString) {
    keyString = String(keyString);
    //Key Type String
    if (keyString.startsWith('"') && keyString.endsWith('"')) {
      return "string";
    }
    //Key Type Number
    if (!isNaN(parseFloat(keyString))) {
      return "number";
    }
    //anything else just use as string aswell
    return "string";
  }