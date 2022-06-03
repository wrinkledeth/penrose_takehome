package utils

import (
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

func Hash_message(message string) []uint8 {
	// Hash message to bytes, returns []uint8 byte array
	data := []byte(message)
	hash := crypto.Keccak256Hash(data)
	return hash.Bytes()
}

func SignMessage(message string, privateKeyHex string) string {
	// Takes a message and private key as string inputs
	// and returns the signature as []uint8 byte array

	// fmt.Println("signing message: ", message)
	hashBytes := Hash_message(message) // Hash message to bytes ([]uint8)

	// Convert private key string to (*ecdsa.PrivateKey)
	privateKey, _ := crypto.HexToECDSA(privateKeyHex)

	// Sign Hash with private key
	signature, _ := crypto.Sign(hashBytes, privateKey)

	return hexutil.Encode(signature)
}

func VerifySignature(message string, signature string, publicKeyHex string) string {
	// Takes a message (string), signature (byte array) and publickey (string 0x..) as inputs
	// returns true if the signature was signed by the given public key and false otherwise

	fmt.Println("verifying signature...")
	hashBytes := Hash_message(message) // Hash message to bytes ([]uint8)

	//Ecrecover returns the uncompressed public key that created the given signature
	signatureBytes, _ := hexutil.Decode(signature)                 // Convert signature string to []byte
	sigPublicKey, _ := crypto.Ecrecover(hashBytes, signatureBytes) //sigPublicKey is []byte

	// Convert signature public key to address (0x...)
	sigPublicKeyAddress := PublicKeyBytesToAddress(sigPublicKey)
	fmt.Println("sigPublicKeyAddress: ", sigPublicKeyAddress)

	// Convert public key string to common.Address
	publicKeyAddress := common.HexToAddress(publicKeyHex)
	fmt.Println("publicKeyAddress: ", publicKeyAddress)

	// Check for match
	matches := strconv.FormatBool(sigPublicKeyAddress == publicKeyAddress)
	fmt.Println("matches: ", string(matches))

	return matches
}

func PublicKeyBytesToAddress(publicKey []byte) common.Address {
	// Takes a public key byte array and returns it in common.Address format (0x...)
	fmt.Print("Converting public key bytes to address...\n")
	hash := crypto.Keccak256Hash(publicKey[1:]) //remove EC prefix 04 and hash
	address := hash[12:]                        // remove first 12 bytes of hash (keep last 20)
	return common.HexToAddress(hex.EncodeToString(address))
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
