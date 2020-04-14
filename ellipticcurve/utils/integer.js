// based on random-number-csprng: https://www.npmjs.com/package/random-number-csprng

const BigInt = require("big-integer");
const crypto = require("crypto");


function modulo(x, n) {
    let mod = x.divmod(n).remainder;

    if (mod.lesser(0)) {
        mod = mod.add(n);
    }

    return mod;
}


function calculateParameters(range) {
	/* This does the equivalent of:
	 *
	 *    bitsNeeded = Math.ceil(Math.log2(range));
	 *    bytesNeeded = Math.ceil(bitsNeeded / 8);
	 *    mask = Math.pow(2, bitsNeeded) - 1;
	 *
	 * ... however, it implements it as bitwise operations, to sidestep any
	 * possible implementation errors regarding floating point numbers in
	 * JavaScript runtimes. This is an easier solution than assessing each
	 * runtime and architecture individually.
	 */

	let bitsNeeded = 0;
	let bytesNeeded = 0;
	let mask = BigInt(1);

	while (range.greater(0)) {
		if (bitsNeeded % 8 === 0) {
			bytesNeeded += 1;
		}

        bitsNeeded += 1;
        mask = mask.shiftLeft(1).or(1); /* 0x00001111 -> 0x00011111 */

        range = range.shiftRight(1);  /* 0x01000000 -> 0x00100000 */
	}

	return {bitsNeeded, bytesNeeded, mask};
}


function secureRandomNumber(minimum, maximum) { // bigint, bigint
    if (crypto == null || crypto.randomBytes == null) {
        throw new Error("No suitable random number generator available. Ensure that your runtime is linked against OpenSSL (or an equivalent) correctly.");
    };

    if (maximum.lesserOrEquals(minimum)) {
        throw new Error("The maximum value must be higher than the minimum value.")
    };

    /* We hardcode the values for the following:
        *
        *   https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER
        *   https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
        *
        * ... as Babel does not appear to transpile them, despite being ES6.
        */

    let range = maximum.minus(minimum);

    let {bitsNeeded, bytesNeeded, mask} = calculateParameters(range);

    let randomBytes = crypto.randomBytes(bytesNeeded);

    var randomValue = BigInt(0);

    /* Turn the random bytes into an integer, using bitwise operations. */
    for (let i = BigInt(0); i.lesser(bytesNeeded); i = i.add(1)) {
        randomValue = randomValue.or(BigInt(randomBytes[i]).shiftLeft(BigInt(8).multiply(i)));
    }

    /* We apply the mask to reduce the amount of attempts we might need
        * to make to get a number that is in range. This is somewhat like
        * the commonly used 'modulo trick', but without the bias:
        *
        *   "Let's say you invoke secure_rand(0, 60). When the other code
        *    generates a random integer, you might get 243. If you take
        *    (243 & 63)-- noting that the mask is 63-- you get 51. Since
        *    51 is less than 60, we can return this without bias. If we
        *    got 255, then 255 & 63 is 63. 63 > 60, so we try again.
        *
        *    The purpose of the mask is to reduce the number of random
        *    numbers discarded for the sake of ensuring an unbiased
        *    distribution. In the example above, 243 would discard, but
        *    (243 & 63) is in the range of 0 and 60."
        *
        *   (Source: Scott Arciszewski)
        */

    randomValue = randomValue.and(mask);

    if (randomValue.lesserOrEquals(range)) {
        /* We've been working with 0 as a starting point, so we need to
            * add the `minimum` here. */
        return minimum.add(randomValue);
    }

    /* Outside of the acceptable range, throw it away and try again.
        * We don't try any modulo tricks, as this would introduce bias. */
    return secureRandomNumber(minimum, maximum);
};


exports.between = secureRandomNumber;
exports.modulo = modulo;
