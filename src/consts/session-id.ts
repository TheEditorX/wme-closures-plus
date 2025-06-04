const SESSION_ID_LENGTH = 12;
const SESSION_RADIX = 36;

const randomSeed = Math.random();
const randomValue = Math.floor(randomSeed * SESSION_RADIX ** SESSION_ID_LENGTH);
export const SessionId = randomValue.toString(36);
