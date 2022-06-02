
# Penrose Takehome Notes
- [Penrose Takehome Notes](#penrose-takehome-notes)
  - [Task](#task)
- [Go](#go)
  - [WSL2 installation](#wsl2-installation)
  - [Modules](#modules)
  - [dotenv](#dotenv)
  - [fmt](#fmt)
- [Echo (Go Web Framework)](#echo-go-web-framework)
  - [Installation](#installation)
  - [http](#http)
    - [Handlers and servemuxes](#handlers-and-servemuxes)
- [GETH (Go Ethereum)](#geth-go-ethereum)
  - [Install CLI Tool (WSL2 Ubuntu via PPA's)](#install-cli-tool-wsl2-ubuntu-via-ppas)
  - [Golang GETH Client Setup](#golang-geth-client-setup)
  - [Get Balance](#get-balance)
  - [Verifying private Key Using ECDSA](#verifying-private-key-using-ecdsa)
- [Ethereum / EVM General Notes](#ethereum--evm-general-notes)
  - [Goerli Testnet](#goerli-testnet)
  - [Solidity](#solidity)
    - [ABI](#abi)
  - [JSON-RPC](#json-rpc)

## Task
Build a REST API to verify it a user owns the private key to the wallet address they claim to have by leveraging ECDSA Signature scheme.

Sub Tasks
- Go HTTP Server (Echo)
- ECDSA verification (query chain with GETH)
- Write Unit Tests



# Go 
https://go.dev/doc/ (docs)
https://pkg.go.dev/ (packages)
https://go.dev/tour/basics/ (tour of go: code snippets)

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
go get -u github.com/ethereum/go-ethereum/ethclient // install module which appears in go.mod
import(
    "github.com/ethereum/go-ethereum/ethclient" // import module in your go file
)
client, err := ethclient.Dial("https://mainnet.infura.io")  // use module
```

## dotenv
``` go
import("github.com/joho/godotenv")
err := godotenv.Load()
if err != nil {
    fmt.Println("Error loading .env file")
}
ropsten_provider_api_key := os.Getenv("ROPSTEN_ALCHEMY_API_KEY")
```

## fmt
```go
fmt.Println('str') // print string
fmt.Printf("%T", variable) // print variable type
```




# Echo (Go Web Framework)
https://echo.labstack.com/guide/
## Installation
```bash
cd penrose_takehome
go mod init penrose_takehome  # Create a go modules: https://go.dev/doc/tutorial/create-module
go get github.com/labstack/echo/v4 # 
go run server.go

```
## http
https://pkg.go.dev/net/http

### Handlers and servemuxes
https://www.alexedwards.net/blog/an-introduction-to-handlers-and-servemuxes-in-go 





# GETH (Go Ethereum)
https://pkg.go.dev/github.com/ethereum/go-ethereum#section-directories (geth package docs)

https://github.com/ethereum/go-ethereum  (Great README on getting started with Go + Geth)

https://ethereum.karalabe.com/talks/2016-devcon.html#5 (Fun Intro Slide)

## Install CLI Tool (WSL2 Ubuntu via PPA's)
https://geth.ethereum.org/docs/install-and-build/installing-geth
``` bash
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```
## Golang GETH Client Setup
GETH Docs: https://goethereumbook.org/client-setup/

Useful Guide: https://hackernoon.com/create-an-api-to-interact-with-ethereum-blockchain-using-golang-part-1-sqf3z7z

``` go 
go get -u github.com/ethereum/go-ethereum/ethclient // install module

import(
    "github.com/ethereum/go-ethereum/ethclient"
)

client, err := ethclient.Dial("https://mainnet.infura.io")  // start geth rpc client (ipc for local geth instance)
```

## Get Balance
``` go 
	// Get balance
	balance, err := client.BalanceAt(context.Background(), common.HexToAddress(address), nil)
	if err != nil {
		log.Fatal(err)
	}

    // Convert from wei to eth
	fbalance := new(big.Float)
	fbalance.SetString(balance.String())
	ethValue := new(big.Float).Quo(fbalance, big.NewFloat(math.Pow10(18)))
	
	fmt.Println("Balance: ", ethValue)
```

## Verifying private Key Using ECDSA
Generating New Wallets: https://goethereumbook.org/wallet-generate/
```go
import(
    "crypto/ecds"
	"github.com/ethereum/go-ethereum/crypto"
)

func new_wallet() {
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		log.Fatal(err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}

	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)
	fmt.Println("From Address: ", fromAddress.String())
}
```
Transferring Eth: https://goethereumbook.org/transfer-eth/


# Ethereum / EVM General Notes
## Goerli Testnet
https://goerlifaucet.com/ (faucet)

Sepolia

Proof of Work (Ethash)
Best reproduces the current Ethereum production environment (PoW)
Website: https://sepolia.dev/
Resources: https://github.com/goerli/sepolia
Goerli

Proof of Authority (Clique)
Most stable for application developers (15s blocktime, no downtimes)
Website: https://goerli.net/
Resources: https://github.com/goerli/testnet

Ropsten / Rinkeby / Kovan Deprecated

## Solidity
### ABI
https://docs.soliditylang.org/en/v0.8.13/abi-spec.html

ABI = Contract Apllication Binary Interface

Contract data is encoded according to it's type. The encoding is not self describing so we need a schema (ABI) in order to decode.

## JSON-RPC
https://geth.ethereum.org/docs/getting-started
https://www.jsonrpc.org/
https://en.wikipedia.org/wiki/Remote_procedure_call

U