# Penrose Takehome

### Project Layout
- main.go (kicks off http server)
- utils/crypo_utils.go (GETH backend for message signing and signature verification) 
- client/client.go (http client for testing)

### Usage
``` bash
# Start Echo Server
go run main.go  

# Run Test Client
go run client.go 
GET /get_message: CQcWgZlFdeFYjNDVxwfEIYAypNocJuEV
POST /verify: true
```

### Research Notes [Notes.md](https://github.com/wrinkledeth/penrose_takehome/blob/main/Notes.md)