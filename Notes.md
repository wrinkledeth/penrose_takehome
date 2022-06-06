
# Penrose Takehome Notes
- [Penrose Takehome Notes](#penrose-takehome-notes)
	- [Task](#task)
- [Go](#go)
	- [Style](#style)
	- [WSL2 installation](#wsl2-installation)
	- [CLI Flags](#cli-flags)
	- [dotenv](#dotenv)
	- [fmt](#fmt)
	- [Hashing](#hashing)
	- [Interfaces](#interfaces)
	- [Maps](#maps)
	- [Modules / Dependencies](#modules--dependencies)
	- [Packages / Importing](#packages--importing)
	- [Pointers](#pointers)
	- [Random String](#random-string)
	- [slices](#slices)
	- [Unit Testing](#unit-testing)
- [GETH (Go Ethereum)](#geth-go-ethereum)
	- [Install CLI Tool (WSL2 Ubuntu via PPA's)](#install-cli-tool-wsl2-ubuntu-via-ppas)
	- [Golang GETH Client Setup](#golang-geth-client-setup)
	- [Get Balance](#get-balance)
	- [Verifying private Key Using ECDSA](#verifying-private-key-using-ecdsa)
		- [Generating New Wallets:](#generating-new-wallets)
		- [Generating Signatures:](#generating-signatures)
		- [Verifying Signatures:](#verifying-signatures)
		- [Uint8 vs Byte](#uint8-vs-byte)
- [Echo (Go Web Framework)](#echo-go-web-framework)
	- [Installation](#installation)
	- [http](#http)
		- [Handlers and servemuxes](#handlers-and-servemuxes)
	- [Task](#task-1)
	- [Session](#session)
		- [Implement session store on server](#implement-session-store-on-server)
		- [Implement Cookie on Client](#implement-cookie-on-client)
		- [POST with NewRequest + cookie](#post-with-newrequest--cookie)
- [Ethereum / EVM General Notes](#ethereum--evm-general-notes)
	- [Testnets](#testnets)
		- [Sepolia:](#sepolia)
		- [Goerli](#goerli)
	- [Solidity](#solidity)
		- [ABI](#abi)
	- [JSON-RPC](#json-rpc)
	- [ECDSA](#ecdsa)
- [Git](#git)
	- [Creating an issue](#creating-an-issue)
	- [Undo last commit](#undo-last-commit)
	- [Undo Git Add](#undo-git-add)
- [AWS Script for cloud deployment](#aws-script-for-cloud-deployment)
	- [AWS CLI Install](#aws-cli-install)
	- [CDK install](#cdk-install)
	- [CDK ec2 w/ typescript](#cdk-ec2-w-typescript)
	- [Adding Userdata to EC2 Instance](#adding-userdata-to-ec2-instance)
		- [To Research : SAM / AWS Amplify / Figma](#to-research--sam--aws-amplify--figma)

## Task
Build a REST API to verify it a user owns the private key to the wallet address they claim to have by leveraging ECDSA Signature scheme.

Sub Tasks
1. ECDSA verification (query chain with GETH) : Complete
2. Go HTTP Server (Echo)
3. Write Unit Tests
4. Error Handling & Edge Cases
5. AWS Deployment script

# Go 
- https://go.dev/doc/ (docs)
- https://pkg.go.dev/ (packages)
- https://go.dev/tour/basics/ (tour of go: code snippets)
- https://gobyexample.com/if-else (go by example)

## Style
https://github.com/golang/go/wiki/CodeReviewComments/#mixed-caps

- In Go, it is convention to uses mixed cap. From the docs: https://golang.org/doc/effective_go.html#mixed-caps

- Finally, the convention in Go is to use MixedCaps or mixedCaps rather than underscores to write multiword names.

- Note that file level names beginning with Capital letter are exported at package level: https://golang.org/doc/effective_go.html#Getters

- Also, it is convention to write acronyms on all caps. So below is fine:
```go
writeToMongoDB // unexported, only visible within the package
// or
WriteToMongoDB // exported
// And not:
writeToMongoDb
```

## WSL2 installation
```bash
wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
sudo tar -xvf go1.18.3.linux-amd64.tar.gz
sudo mv go /usr/local

# .bashrc
export PATH=$PATH:/usr/local/go/bin

go version
```

## CLI Flags
https://gobyexample.com/command-line-flags


## dotenv
``` go
import("github.com/joho/godotenv")
err := godotenv.Load()
if err != nil {
    fmt.Println("Error loading .env file")
}
ropsten_provider_api_key := os.Getenv("ROPSTEN_ALCHEMY_API_KEY")
```

Using godotenv when running tests (from diff directory)
https://github.com/joho/godotenv/issues/43
https://stackoverflow.com/questions/68346410/how-to-use-dynamic-location-for-godotenv-load-env-file


## fmt
```go
fmt.Println('str') // print string
fmt.Printf("%T", variable) // print variable type

// String interpolation? Doesn't exist :(
// https://github.com/golang/go/issues/34174
```

## Hashing
``` go
import("github.com/ethereum/go-ethereum/crypto")
func hash_message(message string) []uint8 {
	// Hash message to bytes, returns []uint8 byte array
	data := []byte(message) //byte[]
	hash := crypto.Keccak256Hash(data) //common.hash 
	return hash.Bytes()
}

//To convert public key (bytes) to 0x... Address:
func PublicKeyBytesToAddress(publicKey []byte) common.Address {
	hash := crypto.Keccak256Hash(publicKey[1:]) //remove EC prefix 04 and hash
	address := hash[12:]  // remove first 12 bytes of hash (keep last 20)
	return common.HexToAddress(hex.EncodeToString(address))
}
```

## Interfaces
https://gobyexample.com/interfaces
https://jordanorelli.com/post/32665860244/how-to-use-interfaces-in-go

## Maps
https://gobyexample.com/maps

## Modules / Dependencies
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


## Packages / Importing
https://go.dev/doc/code
https://linguinecode.com/post/how-to-import-local-files-packages-in-golang

## Pointers 
https://medium.com/@meeusdylan/when-to-use-pointers-in-go-44c15fe04eac

## Random String
https://stackoverflow.com/questions/22892120/how-to-generate-a-random-string-of-a-fixed-length-in-go

## slices
A slice is a dynamically-sized array. []T is a slice of type T
```go
// Array of integers, size = 6 
primes := [6]int{2, 3, 5, 7, 11, 13}
// Slice of integers
var s []int = primes[1:4]
fmt.Println(s) // [3 5 7]
```

## Unit Testing
https://go.dev/doc/tutorial/add-a-test


Assertions:
https://gist.github.com/samalba/6059502


https://www.practical-go-lessons.com/chap-19-unit-tests

# GETH (Go Ethereum)
[GETH package docs](https://pkg.go.dev/github.com/ethereum/go-ethereum#section-directories)

[GETH Git Repo: Gerat learning resources in readme](https://github.com/ethereum/go-ethereum)

[Go Ethereum Book (Best Documentation)](https://goethereumbook.org/)

## Install CLI Tool (WSL2 Ubuntu via PPA's)
https://geth.ethereum.org/docs/install-and-build/installing-geth
``` bash
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```
## Golang GETH Client Setup
[GETH Book: Client Setup](https://goethereumbook.org/client-setup/)

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
Important Readings
- [Mastering Bitcoin (keys and addresses)](https://www.oreilly.com/library/view/mastering-bitcoin-2nd/9781491954379/ch04.html)

### Generating New Wallets: 
https://goethereumbook.org/wallet-generate/
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

### Generating Signatures: 
https://goethereumbook.org/signature-generate/
```go
func signMessage(message string, privateKeyHex string) []uint8 {
	// Convert private key to bytes
	privateKey, _ := crypto.HexToECDSA(privateKeyHex)

	// Hash message
	data := []byte(message) // message in bytes
	hash := crypto.Keccak256Hash(data)  

	// Sign Hash
	signature, _ := crypto.Sign(hash.Bytes(), privateKey)
	fmt.Println("signature: ", hexutil.Encode(signature))
}
```
### Verifying Signatures: 
https://goethereumbook.org/signature-verify/

Need 3 things to verify a signature:
- Signature
- Hash of original data
- Public Key of Signer

Problem:
``` go
//Ecrecover returns the uncompressed public key that created the given signature
sigPublicKey, _ := crypto.Ecrecover(hashBytes, signatureBytes) //sigPublicKey is []byte
fmt.Println("sigPublicKey: ", sigPublicKey)

// PROBLEM
// here... sigPublicKey is a byte array ([]byte) 
// sigPublicKey:  [4 122 186 170 102 59 76 116 225 126 12 59 194 81 215 121 109 87 68 221 247 140 74 225 215 40 140 99 17 224 80 94 130 249 24 45 83 82 62 145 214 133 195 75 142 91 226 17 168 149 119 220 155 230 226 103 2 55 184 89 2 238 39 81 141]

// But we are comparing it to a hex publix key address (0xd9ae60EE41D999562eDD101E2096D38D1C19F982)

```

Converting Public Key from Bytes to Hex:

How the 0x... wallet address is generated: https://ethereum.org/en/developers/docs/accounts/#:~:text=Account%20creation,-When%20you%20want&text=The%20public%20key%20is%20generated,adding%200x%20to%20the%20beginning.
```
The public key is generated from the private key using the Elliptic Curve Digital Signature Algorithm. You get a public address for your account by taking the last 20 bytes of the Keccak-256 hash of the public key and adding 0x to the beginning.
```
0x Address from bytes:
https://ethereum.stackexchange.com/questions/65019/goethereum-getting-publickeybytes-from-given-public-key  

To derive the public address from the public key bytes, you need to take the last 20 bytes from the keccack256 hash of the public key:

*** This is important. You can get the wallet address from the public key, but not the reverse! 

Public key Bytes to Hex

``` go
import(
    github.com/ethereum/go-ethereum/common
    github.com/ethereum/go-ethereum/common/hexutil
    golang.org/x/crypto/sha3
)

func PublicKeyBytesToAddress(publicKey []byte) common.Address {
	// Takes a public key byte array and returns it in common.Address format (0x...)
	hash := crypto.Keccak256Hash(publicKey[1:]) //remove EC prefix 04 and hash
	address := hash[12:]  // remove first 12 bytes of hash (keep last 20)
	return common.HexToAddress(hex.EncodeToString(address))
}
```

Private Key Address to Public Key Bytes
``` go
func publicKeyHexToBytes(privateKeyHex string) string {
	// Convert private key to bytes  (*ecdsa.PrivateKey)
	privateKey, _ := crypto.HexToECDSA(privateKeyHex)
	// fmt.Println("privateKey: ", privateKey)

	// Get public key bytes
	publicKey := privateKey.Public()
	publicKeyECDSA, _ := publicKey.(*ecdsa.PublicKey)
	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)

	// Convert public key bytes to hex
	publicKeyHex := hexutil.Encode(publicKeyBytes)
	// fmt.Println("publicKeyHex: ", publicKeyHex)

	return publicKeyHex
```
### Uint8 vs Byte
NOTE: byte is an alias for uint8 and is equivalent to uint8 in all ways. It is used, by convention, to distinguish byte values from 8-bit unsigned integer values.

https://pkg.go.dev/builtin#:~:text=type%20byte,-type%20byte%20%3D%20uint8&text=byte%20is%20an%20alias%20for,8%2Dbit%20unsigned%20integer%20values.






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

## Task
```
1) /get_message GET
Request Body: none
Response Body:
{
“message”: “random_message”
}

2) /verify POST
Request Body:
{
“address”: “0x_some_wallet_address”,
“signedMessage”: “signed_random_message_using_private_key”
}
Response Body:
{
“verified”: true (false)
}
```

## Session
https://echo.labstack.com/middleware/session/
https://github.com/go-session/echo-session
https://github.com/gorilla/sessions#store-implementations


### Implement session store on server
Cookie info can be viewed in chrome like so:
F12 (developer mode) -> applications tab -> cookies -> select site

Server Code
``` go
	e := echo.New() // create new echo instance

	e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))

	// Get new message
	e.GET("/get_message", func(c echo.Context) error {
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   0,
			HttpOnly: false,
			Secure:   true,
		}
		randomMessage := utils.RandSeq() //32 character random string
		sess.Values["message"] = randomMessage
		sess.Save(c.Request(), c.Response())
		return c.String(http.StatusOK, randomMessage)
	})

	// Get previous message from session
	e.GET("/session_message", func(c echo.Context) error {
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}

		message := sess.Values["message"].(string)

		return c.String(http.StatusOK, message)
	})
```
### Implement Cookie on Client
https://stackoverflow.com/questions/12756782/go-http-post-and-use-cookies
https://pkg.go.dev/net/http#Response.Cookies
https://pkg.go.dev/net/http#Request.AddCookie

Client Code
```go
func getMessage() (string, *http.Cookie) {
	resp, err := http.Get("http://127.0.0.1:1323/get_message")
	if err != nil {
		fmt.Println("Get Error") // handle error
	}
	defer resp.Body.Close()

	// save cookie
	cookie := resp.Cookies()[0]

	// read response
	body, _ := io.ReadAll(resp.Body)
	return string(body), cookie
}

func getSessionMessage(cookie *http.Cookie) string {

	req, err := http.NewRequest("GET", "http://127.0.0.1:1323/session_message", nil)
	if err != nil {
		fmt.Println("Get Error")
	}
	req.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})

	client := &http.Client{}
	resp, err := client.Do(req)

	body, _ := io.ReadAll(resp.Body)
	return string(body)
}
```

### POST with NewRequest + cookie
https://gist.github.com/17twenty/2fb30a22141d84e52446

Server
``` go
	e.POST("/verify", func(c echo.Context) error { // verify signature
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}

		address := c.FormValue("address")
		signedMessage := c.FormValue("signedMessage")
		message := sess.Values["message"].(string)

		result := utils.VerifySignature(message, signedMessage, address)
		return c.String(http.StatusOK, result)
	})

```

Client
``` go
func postVerify(address string, signedMessage string, cookie *http.Cookie) string {
	data := url.Values{
		"address":       {address},
		"signedMessage": {signedMessage},
	}

	postBody := bytes.NewBufferString(data.Encode())                                 // url encoded data in body
	req, _ := http.NewRequest("POST", "http://127.0.0.1:1323/verify", postBody)      // create POST request
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value") // header to specify url encoded data
	req.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})              // add cookie to request to keep session

	client := &http.Client{}
	resp, _ := client.Do(req)
	body, _ := io.ReadAll(resp.Body)

	return string(body)
}
```





# Ethereum / EVM General Notes
## Testnets
### Sepolia: 
- Proof of Work (Ethash) Best reproduces the current Ethereum production environment (PoW)
- Website: https://sepolia.dev/
- Resources: https://github.com/goerli/sepolia

### Goerli
- Proof of Authority (Clique)Most stable for application developers (15s blocktime, no downtimes)
- Website: https://goerli.net/
- Resources: https://github.com/goerli/testnet
- Faucet: https://goerlifaucet.com/ (faucet)

(Ropsten / Rinkeby / Kovan Deprecated)

## Solidity
### ABI
https://docs.soliditylang.org/en/v0.8.13/abi-spec.html

ABI = Contract Apllication Binary Interface

Contract data is encoded according to it's type. The encoding is not self describing so we need a schema (ABI) in order to decode.

## JSON-RPC
https://geth.ethereum.org/docs/getting-started

https://www.jsonrpc.org/

https://en.wikipedia.org/wiki/Remote_procedure_call

## ECDSA 
https://hackernoon.com/a-closer-look-at-ethereum-signatures-5784c14abecc

https://medium.com/mycrypto/the-magic-of-digital-signatures-on-ethereum-98fe184dc9c7


- Ethereum wallet address is the hashed version of the public key
- Before blockchain, this elliptic curve standard was not common at all. In fact, most mainstream hardware vendors don’t support hardware encryption for this curve. It is rumored that secp256k1 was picked because it has the least likelihood of having kleptographic backdoors implanted by the NSA. :0
- K (message to be signed) needs to be a secure random value. When k is not sufficiently random, or when the value is not secret, it’s possible to calculate the private key using two different signatures (“fault attack”).


# Git 
## Creating an issue
https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue

## Undo last commit
git-tower.com/learn/git/faq/undo-last-commit

```bash
# Soft reset (revisions preserved)
git reset --soft HEAD~1

# Hard reset(revisions discarded)
git reset --hard HEAD~1
```

## Undo Git Add
```bash
git reset <file> # single file
git reset # Unstage all changes
```


# AWS Script for cloud deployment
Plan: use AWS CDK to generate cloudformation template which:
- creates VPC and internet gateway
- creates EC2
- pushes golang code

setup cdk: https://aws.amazon.com/getting-started/guides/setup-cdk/ 

cdk with go: https://www.go-on-aws.com/infrastructure-as-go/cdk-go/cdk-instance/

## AWS CLI Install
```bash
# install aws-cli
sudo apt-install awscli

aws configure

zen@zenDESKTOP:~/.aws$ aws sts get-caller-identity
{
    "UserId": "AIDATZP75XK6TZ34HNKUB",
    "Account": "260919114429",
    "Arn": "arn:aws:iam::260919114429:user/wrinkled"
}
# This user has full ec2, cloudformation, and vpc permissions
```
## CDK install
deploying webapp with cdk: https://aws.amazon.com/getting-started/guides/deploy-webapp-ec2/module-one/

cdkv2 error: https://github.com/aws/aws-cdk/issues/542


```bash
#install cdk
npm install -g aws-cdk

# Get the account ID
aws sts get-caller-identity
# Bootstrap the account
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
cdk bootstrap aws://260919114429/us-east-1

CDKToolkit: creating CloudFormation changeset...
 ✅  Environment aws://260919114429/us-east-1 bootstrapped.

mkdir ec2-cdk
cd ec2-cdk
cdk init app --language typescript

npm i @aws-cdk/aws-ec2 @aws-cdk/aws-iam @aws-cdk/aws-s3-assets cdk-ec2-key-pair
```

## CDK ec2 w/ typescript
clone this down:
https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/ec2-instance
npm install

```
npm run build
cdk deploy
cdk destroy
```
## Adding Userdata to EC2 Instance
https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html

https://aws.amazon.com/getting-started/guides/deploy-webapp-ec2/module-two/

https://bobbyhadz.com/blog/aws-cdk-ec2-userdata-example

Trouble shoot user data script:
```bash
cat /var/log/cloud-init-output.log
...

Working Userdata Script
```bash
#!/bin/bash -xe

cd /home/ec2-user
mkdir go

# Install OS Dependencies
sudo yum update -y
sudo yum install git -y
sudo yum install gcc -y

# Install Golang
wget https://go.dev/dl/go1.18.3.linux-arm64.tar.gz
tar -C /usr/local -zxvf go1.18.3.linux-arm64.tar.gz
export PATH=$PATH:/usr/local/go/bin
export GOPATH=/home/ec2-user/go
export GOCACHE=/home/ec2-user/.cache/go-build
go version

# Clone Repo
git clone https://github.com/wrinkledeth/penrose_takehome.git
cd penrose_takehome
go get -d -v ./... # Install Go modules
go run main.go # Start HTTP Service

```

### To Research : SAM / AWS Amplify / Figma