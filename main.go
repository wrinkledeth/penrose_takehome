package main

import (
	"context"
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"log"
	"math"
	"math/big"
	"net/http"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/sha3"
)

func loadDotenv() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}
}

func startHTTPServer() {
	//! Start HTTP server (hello world code, needs work)
	e := echo.New()
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.Logger.Fatal(e.Start(":1323"))
}

func getGETHClient() *ethclient.Client {
	// Get provider URL
	provider := os.Getenv("GOERLI_PROVIDER")
	fmt.Println("provider: ", provider)

	// Start GETH client
	client, err := ethclient.Dial(provider)
	if err != nil {
		fmt.Println(err)
	}

	return client
}

func getBalance(address string) {
	client := getGETHClient()

	// Get balance
	balance, err := client.BalanceAt(context.Background(), common.HexToAddress(address), nil)
	if err != nil {
		log.Fatal(err)
	}

	// Convert from wei to ether
	fbalance := new(big.Float)
	fbalance.SetString(balance.String())
	ethValue := new(big.Float).Quo(fbalance, big.NewFloat(math.Pow10(18)))

	fmt.Println("Balance: ", ethValue)
}

func signMessage(message string, privateKeyHex string) []uint8 {
	// Convert private key to bytes
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		log.Fatal(err)
	}

	// Hash message
	data := []byte(message)
	hash := crypto.Keccak256Hash(data)
	fmt.Println("message hash: ", hash.Hex())

	// Sign Hash
	signature, err := crypto.Sign(hash.Bytes(), privateKey)
	if err != nil {
		log.Fatal(err)
	}

	return signature
}

func PublicKeyBytesToAddress(publicKey []byte) common.Address {
	var buf []byte

	hash := sha3.New256()
	// hash := sha3.NewLegacyKeccak256()
	hash.Write(publicKey[1:]) // remove EC prefix 04
	buf = hash.Sum(nil)
	address := buf[12:]

	return common.HexToAddress(hex.EncodeToString(address))
}

// func verifySignature(message string, signature []uint8, publicKeyHex string) bool {
// 	// Convert public key to bytes

// }

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

func main() {
	// Load .env file
	loadDotenv()

	//Sign Message
	privKey := os.Getenv("GOERLI_PRIVATE_KEY")
	message := "Arbitrary Message"
	signature := signMessage(message, privKey)
	fmt.Println("signature: ", hexutil.Encode(signature))

	// pubkey := "0xd9ae60EE41D999562eDD101E2096D38D1C19F982"
	// out := PublicKeyBytesToAddress([]byte(pubkey))
	// fmt.Println("out: ", out)

	// getBalance(pubkey)
	// startHTTPServer()
}
