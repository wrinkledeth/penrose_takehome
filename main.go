package main

import (
	"encoding/hex"
	"fmt"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/sha3"
)

func loadDotenv() {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}
}

// func startHTTPServer() {
// 	//! Start HTTP server (hello world code, needs work)
// 	e := echo.New()
// 	e.GET("/", func(c echo.Context) error {
// 		return c.String(http.StatusOK, "Hello, World!")
// 	})
// 	e.Logger.Fatal(e.Start(":1323"))
// }

// func getGETHClient() *ethclient.Client {
// 	// Get provider URL
// 	provider := os.Getenv("GOERLI_PROVIDER")
// 	fmt.Println("provider: ", provider)
//
// 	// Start GETH client
// 	client, err := ethclient.Dial(provider)
// 	if err != nil {
// 		fmt.Println(err)
// 	}
//
// 	return client
// }

// func getBalance(address string) {
// 	client := getGETHClient()
//
// 	// Get balance
// 	balance, err := client.BalanceAt(context.Background(), common.HexToAddress(address), nil)
// 	if err != nil {
// 		log.Fatal(err)
// 	}
//
// 	// Convert from wei to ether
// 	fbalance := new(big.Float)
// 	fbalance.SetString(balance.String())
// 	ethValue := new(big.Float).Quo(fbalance, big.NewFloat(math.Pow10(18)))
//
// 	fmt.Println("Balance: ", ethValue)
// }

func hash_message(message string) []uint8 {
	// Hash message to bytes, returns []uint8 byte array
	data := []byte(message)
	hash := crypto.Keccak256Hash(data)
	return hash.Bytes()
}

func signMessage(message string, privateKeyHex string) []uint8 {
	// Takes a message and private key as string inputs
	// and returns the signature as []uint8 byte array

	fmt.Println("signing message: ", message)
	hashBytes := hash_message(message) // Hash message to bytes ([]uint8)

	// Convert private key string to (*ecdsa.PrivateKey)
	privateKey, _ := crypto.HexToECDSA(privateKeyHex)

	// Sign Hash with private key
	signature, _ := crypto.Sign(hashBytes, privateKey)

	return signature
}

func verifySignature(message string, signatureBytes []uint8, publicKeyHex string) bool {
	// Takes a message (string), signature (byte array) and publickey (string 0x..) as inputs
	// returns true if the signature was signed by the given public key and false otherwise

	fmt.Println("verifying signature...")
	hashBytes := hash_message(message) // Hash message to bytes ([]uint8)
	// fmt.Println("hashBytes: ", hashBytes)

	//Ecrecover returns the uncompressed public key that created the given signature
	sigPublicKey, _ := crypto.Ecrecover(hashBytes, signatureBytes) //sigPublicKey is []byte
	// fmt.Println("sigPublicKey: ", sigPublicKey)

	// Convert signature public key to address (0x...)
	sigPublicKeyAddress := PublicKeyBytesToAddress(sigPublicKey)
	fmt.Println("sigPublicKeyAddress: ", sigPublicKeyAddress)

	// Convert public key string to common.Address
	publicKeyAddress := common.HexToAddress(publicKeyHex)
	fmt.Println("publicKeyAddress: ", publicKeyAddress)

	// Check for match
	matches := sigPublicKeyAddress == publicKeyAddress

	return matches
}

func PublicKeyBytesToAddress(publicKey []byte) common.Address {
	// Takes a public key byte array and returns it in common.Address format (0x...)
	fmt.Print("\nConverting public key bytes to address...\n")
	var buf []byte
	fmt.Println("publicKey: ", publicKey)
	hash := sha3.NewLegacyKeccak256() //new Keccak-256 hash.
	fmt.Println("hash: ", hash)
	hash.Write(publicKey[1:]) // remove EC prefix 04 and prep for hashing
	fmt.Println("hash.Write(publicKey[1:]): ", hash)
	buf = hash.Sum(nil) // compute hash
	fmt.Println("buf: ", buf)
	address := buf[12:] // remove first 12 bytes of hash (keep last 20)
	fmt.Println("address: ", address)
	fmt.Println()

	return common.HexToAddress(hex.EncodeToString(address))
}

func main() {
	// Load .env file and get public / private key pair
	loadDotenv()
	privKey := os.Getenv("GOERLI_PRIVATE_KEY")
	pubKey := "0xd9ae60EE41D999562eDD101E2096D38D1C19F982"

	//Sign Message with Priv Key
	message := "hello"
	signature := signMessage(message, privKey)
	fmt.Println("signature hex: ", hexutil.Encode(signature))
	fmt.Println()

	// Verify Signature
	out := verifySignature(message, signature, pubKey)
	fmt.Println("verifySignature: ", out)

	// getBalance(pubkey)
	// startHTTPServer()
}
