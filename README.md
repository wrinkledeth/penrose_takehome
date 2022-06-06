# Penrose Takehome
This project implements a REST API which verifies if a user owns the private key to a wallet address they claim to have by leveraging the ECDSA signature scheme.

### Project Layout
- main.go (http server implementing Echo REST API)
- client/client.go (http client for testing)
- utils/crypo_utils.go (GETH backend utils for message signing and signature verification) 
- tests/utils_test.go (unit tests for utility functions)
- scripts/ec2-cdk (CDK Infrastructure as code for automated deployment to AWS EC2)

### Usage
.env
``` bash
# Make sure you have .env in your root directory configured like so
cat project_root/.env
PUBLIC_KEY=<0x...>
PRIVATE_KEY=<insert corresponding private key here>
```

Server
```bash 
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
```

Client
```bash
# Run Test Client
cd client  # Required

# Local REST API Server (http://127.0.0.1:1323)
go run client.go 
GET /get_message: {"message":"i7qIdSzs1Z7ESgEtpdx2JSjiAwjHFKRO"}
POST /verify: {"verified":"true"}

# Remote Endpoint (ex: AWS EC2)
go run client.go -url=http://34.239.185.11:1323
GET /get_message: {"message":"gh1TAwW1mEVl8o6syeZ2YYgGOEkhGasP"}
POST /verify: {"verified":"true"}
```

Unit Tests
```bash
# Unit Tests
go test tests/utils_test.go -v
```
--- 

### AWS Deployment Code: [ec2-cdk](https://github.com/wrinkledeth/penrose_takehome/tree/main/scripts/ec2-cdk)

### Research Notes: [Notes.md](https://github.com/wrinkledeth/penrose_takehome/blob/main/Notes.md)
