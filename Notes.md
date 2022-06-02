# Penrose Takehome Notes
Build a REST API to verify it a user owns the private key to the wallet address they claim to have by leveraging ECDSA Signature scheme.

Tasks
- Go HTTP Server (Echo)
- ECDSA verification (query chain with GETH)
- Write Unit Tests


# Go 
## WSL2 installation
```bash
wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
sudo tar -xvf go1.18.3.linux-amd64.tar.gz
sudo mv go /usr/local

# .bashrc
export PATH=$PATH:/usr/local/go/bin

go version
```
## Modules
https://go.dev/ref/mod#go-mod-init
https://faun.pub/understanding-go-mod-and-go-sum-5fd7ec9bcc34
go.mod is for dependency mangement 
``` go 
go mod init [current_folder] // Creates a new go.mod file (new module in cwd). 
go get [package] // installs module to go.mod file
```

## fmt
```go
fmt.Println('str') // print string
```

## http
https://pkg.go.dev/net/http


# Echo (Go Web Framework)
https://echo.labstack.com/guide/
## Installation
```bash
cd penrose_takehome
go mod init penrose_takehome  # Create a go modules: https://go.dev/doc/tutorial/create-module
go get github.com/labstack/echo/v4 # 

go run server.go

```