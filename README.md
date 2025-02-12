# ECDSA Node TypeScript

A TypeScript implementation of the Elliptic Curve Digital Signature Algorithm (ECDSA).

## Features

- Full TypeScript support with type definitions
- OpenSSL-compatible implementation
- Fast and efficient using Jacobian coordinates
- Supports secp256k1 and prime256v1 (P-256) curves
- Comprehensive test suite

## Installation

```bash
npm install ecdsa-node-ts
# or
yarn add ecdsa-node-ts
```

## Usage

```typescript
import { PrivateKey, Ecdsa } from "ecdsa-node-ts";

// Generate new private key
const privateKey = new PrivateKey();

// Get public key
const publicKey = privateKey.publicKey();

// Create message
const message = "My message";

// Create signature
const signature = Ecdsa.sign(message, privateKey);

// Verify signature
const verified = Ecdsa.verify(message, signature, publicKey);
console.log(verified); // true
```

### Working with PEM files

```typescript
// Import keys from PEM
const privateKeyPem = File.read("privateKey.pem");
const privateKey = PrivateKey.fromPem(privateKeyPem);

const publicKeyPem = File.read("publicKey.pem");
const publicKey = PublicKey.fromPem(publicKeyPem);

// Export keys to PEM
const pemPrivate = privateKey.toPem();
const pemPublic = publicKey.toPem();
```

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests
yarn test

# Clean build files
yarn clean
```

## License

MIT License
