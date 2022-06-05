package utils

import (
	"encoding/hex"
	"fmt"
	"math/rand"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/joho/godotenv"
)

func LoadEnv(path string) {
	// Load .env file if it exists
	err := godotenv.Load(path)
	if err != nil {
		fmt.Println("Error loading .env file")
	}
}

func RandSeq() string {
	rand.Seed(time.Now().UnixNano())
	var chars = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
	message := make([]rune, 32)
	for i := range message {
		message[i] = chars[rand.Intn(len(chars))]
	}
	return string(message)
}

func HashMessage(message string) []uint8 {
	// Helper function: Hash message to bytes, returns []uint8 byte array
	data := []byte(message)
	hash := crypto.Keccak256Hash(data)
	return hash.Bytes()
}

func PublicKeyBytesToAddress(publicKey []byte) common.Address {
	// Wallet Address computed by taking Keccak256 hash of public key, and then keeping the last 20 bytes
	hash := crypto.Keccak256Hash(publicKey[1:]) //remove EC prefix 04 and hash
	address := hash[12:]                        // remove first 12 bytes of hash (keep last 20)
	return common.HexToAddress(hex.EncodeToString(address))
}

func SignMessage(message string, privateKeyHex string) string {
	// Takes a message and private key as string inputs
	// and returns the signature as a string

	// fmt.Println("Signing message with private key... ")
	hashBytes := HashMessage(message) // Hash message to bytes ([]uint8)

	// Convert private key string to (*ecdsa.PrivateKey)
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		fmt.Println("Error converting private key to ECDSA")
		return ""
	}

	// Sign Hash with private key
	signature, err := crypto.Sign(hashBytes, privateKey)
	if err != nil {
		fmt.Println("Error signing hash")
	}

	return hexutil.Encode(signature)
}

func VerifySignature(message string, signature string, address string) bool {
	// Takes a message, signature, and  wallet address as string inputs
	// returns true if the signature was signed by the wallet owner, and false otherwise

	// fmt.Println("verifying signature...:", signature)
	hashBytes := HashMessage(message) // Hash message to bytes ([]uint8)

	//Ecrecover returns the uncompressed public key that created the given signature
	signatureBytes, err := hexutil.Decode(signature) // Convert signature string to []byte
	if err != nil {
		fmt.Println("Error converting signature to bytes")
		return false
	}

	sigPublicKey, err := crypto.Ecrecover(hashBytes, signatureBytes) //sigPublicKey is []byte
	if err != nil {
		fmt.Println("Error ecrecovering signature")
		return false
	}

	// Convert signature public key to address (0x...)
	sigAddress := PublicKeyBytesToAddress(sigPublicKey)

	// Check for match
	matches := (sigAddress.Hex() == address)
	fmt.Println("Provided Wallet Address: ", address)
	fmt.Println("Signature Derived Address: ", sigAddress)
	fmt.Println("matches: ", matches)

	return matches
}
