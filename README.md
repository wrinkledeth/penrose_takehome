# Penrose Takehome

### Project Layout
- main.go (kicks off http server)
- utils/crypo_utils.go (GETH backend utils for message signing and signature verification) 
- client/client.go (http client for testing)

### Usage
``` bash
# Make sure you have .env in your root directory configured like so
cat project_root/.env
PUBLIC_KEY=0xd9ae60EE41D999562eDD101E2096D38D1C19F982
PRIVATE_KEY= <insert corresponding private key here>

# Start Echo Server
go run main.go  

# Run Test Client
go run client.go 
GET /get_message: CQcWgZlFdeFYjNDVxwfEIYAypNocJuEV
POST /verify: true
```

### Research Notes [Notes.md](https://github.com/wrinkledeth/penrose_takehome/blob/main/Notes.md)