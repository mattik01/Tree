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