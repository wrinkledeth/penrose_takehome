# Penrose Takehome
This project implements a REST API which verifies if a user owns the private key to a wallet address they claim to have by leveraging the ECDSA signature scheme.

### Project Layout
- main.go (http server implementing Echo REST API)
- client/client.go (http client for testing)
- utils/crypo_utils.go (GETH backend utils for message signing and signature verification) 
- tests/utils_test.go (unit tests for utility functions)

### Usage
``` bash
# Make sure you have .env in your root directory configured like so
cat project_root/.env
PUBLIC_KEY=0x000060EE41D999562eDD101E2096D38D1C19F982
PRIVATE_KEY= <insert corresponding private key here>

# Start Echo Server
go run main.go  
⇨ http server started on [::]:1323
GET received... # output after running test client
Message Generated:  3mj1NhrU8gY6k7e1szUARuGZTuTAQvPn

POST received...
Session Stored Message:  3mj1NhrU8gY6k7e1szUARuGZTuTAQvPn
sigPublicKeyAddress:  0xd9ae60EE41D999562eDD101E2096D38D1C19F982
publicKeyAddress:  0xd9ae60EE41D999562eDD101E2096D38D1C19F982
matches:  true

# Run Test Client
go run client.go 
GET /get_message: 3mj1NhrU8gY6k7e1szUARuGZTuTAQvPn
POST /verify: true
```

### Research Notes [Notes.md](https://github.com/wrinkledeth/penrose_takehome/blob/main/Notes.md)