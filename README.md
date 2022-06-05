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
PUBLIC_KEY=<0x...>
PRIVATE_KEY=<insert corresponding private key here>

# Start Echo Server
go run main.go  
⇨ http server started on [::]:1323
GET received... 
Message Generated:  NkCHlIsY8uV0OmdS0AbGbeUSrROMFlzK
POST received...
Session Stored Message:  NkCHlIsY8uV0OmdS0AbGbeUSrROMFlzK
Provided Wallet Address:  0x96216849c49358B10257cb55b28eA603c874b05E
Signature Derived Address:  0x96216849c49358B10257cb55b28eA603c874b05E
matches:  true

# Run Test Client
cd client # required
go run client.go 
GET /get_message: {"message":"NkCHlIsY8uV0OmdS0AbGbeUSrROMFlzK"}
POST /verify: {"verified":"true"}

# Unit Tests
go test tests/utils_test.go -v
```



### Research Notes [Notes.md](https://github.com/wrinkledeth/penrose_takehome/blob/main/Notes.md)
