import { $storeValues } from "./app.js";

// CALCULATE CLIENT SEED
export function clientSeed(length) {
  const availableChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString +=
      availableChars[Math.floor(Math.random() * availableChars.length)];
  }
  return randomString;
}

// CALCULATE SERVER SEED
export function serverSeed() {
  var baseString = CryptoJS.enc.Hex.parse(clientSeed(256));
  return baseString;
}
// GENERATE FINAL HASH(CLIENT + SERVER + NONCE)
export function getHash() {
  var combination = CryptoJS.SHA512(
    $storeValues.clientSeed + $storeValues.serverSeed + $storeValues.nonce
  );
  return combination;
}

export const getResult = (hashedValue) => {
  // the offset of the interval
  let index = 0;
  // result variable
  let result;

  do {
    // get the decimal value from an interval of 5 hex letters
    result = parseInt(
      hashedValue.toString().substring(index * 5, index * 5 + 5),
      16
    );
    // increment the offset in case we will need to repeat the operation above
    index += 1;
    // if all the numbers were over 999999 and we reached the end of the string, we set that to a default value of 9999 (99 as a result)
    if (index * 5 + 5 > 129) {
      result = 9999;
      break;
    }
  } while (result >= 1e6);
  // the result is between 0-999999 and we need to convert if into a 4 digit number
  // we a apply a modulus of 1000 and the 4 digit number is further split into a 2 digit number with decimals
  return [result % 1e4] * 1e-2;
};
