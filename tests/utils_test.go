package tests

import (
	"crypto/ecdsa"
	"fmt"
	"log"
	"os"
	"testing"

	"penrose_takehome/utils"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

/*
# Test Cases

LoadEnv:
- Succesfully loads env (pub + priv key)
- Validate keypair ("pub key" == "pub key derived from priv key")

RandSeq:
- output of correct length and type

HashMessage:
- assert(input -> correct output)
- input != string?

PublicKeyBytesToAddress:
- assert(input -> correct output)
- input != []byte?
- input not a public key?

SignMessage:
- assert(input -> correct output)
- inputs of wrong type?

VerifySignature:
- assert(input -> correct output)
- inputs of wrong type?

Test cases will use Key Pair from go-ethereum tutorials
privkey : fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19
pubkey : 0x049a7df67f79246283fdc93af76d4f8cdd62c4886e8cd870944e817dd0b97934fdd7719d0810951e03418205868a5c1b40b192451367f28e0088dd75e15de40c05
address : 0x96216849c49358B10257cb55b28eA603c874b05E

*/

func TestLoadEnv(t *testing.T) {
	// load key pair
	utils.LoadEnv("../.env")
	providedPrivateKey := os.Getenv("PRIVATE_KEY")
	providedPublicKeyString := os.Getenv("PUBLIC_KEY")
	providedPublicKey := common.HexToAddress(providedPublicKeyString)

	privKeyECDSA, err := crypto.HexToECDSA(providedPrivateKey)
	if err != nil {
		log.Fatal(err)
	}

	publicKey := privKeyECDSA.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}

	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)
	derivedPublicKey := utils.PublicKeyBytesToAddress(publicKeyBytes)

	fmt.Println("provided public key: ", providedPublicKey)
	fmt.Println("derived public key: ", derivedPublicKey)

	match := (providedPublicKey == derivedPublicKey)
	if !match {
		t.Error(".env PRIVATE_KEY does not correspond to PUBLIC_KEY")
		t.Errorf("Derived Public Key %s does not match actual %s", providedPublicKey, derivedPublicKey)
	}
}

func TestRandSeq(t *testing.T) {
	randSeq := utils.RandSeq()
	if len(randSeq) != 32 {
		t.Error("RandSeq() output is not 32 bytes")
	}
}

func TestHashMessage(t *testing.T) {
	expectedHash := "0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0"

	message := "Hello World!"
	hashBytes := utils.HashMessage(message)
	hash := hexutil.Encode(hashBytes)

	if hash != expectedHash {
		t.Errorf("HashMessage output %s does not match expected hash %s", hash, expectedHash)
	}
}

func TestPublicKeyBytesToAddress(t *testing.T) {
	expectedAddress := "0x96216849c49358B10257cb55b28eA603c874b05E"

	pubKeyHex := "0x049a7df67f79246283fdc93af76d4f8cdd62c4886e8cd870944e817dd0b97934fdd7719d0810951e03418205868a5c1b40b192451367f28e0088dd75e15de40c05"
	pubKeyBytes, _ := hexutil.Decode(pubKeyHex)
	pubKey := utils.PublicKeyBytesToAddress(pubKeyBytes).Hex()

	if pubKey != expectedAddress {
		t.Errorf("PublicKeyBytesToAddress() output %s does not match expected address %s", pubKey, expectedAddress)
	}

}

func TestSignMessage(t *testing.T) {
	expectedSignature := "0x2da71721e3fbb58b0a2351ba5e8ac0fd0ac4d57818f3f762c0f424e7dc6a1de92ca49748fe677d9c60578fd9104dea015ad456a984af187ce5dcdc24c9800fb400"

	message := "Hello World!"
	privateKey := "fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19"
	signature := utils.SignMessage(message, privateKey)

	if signature != expectedSignature {
		t.Errorf("SignMessage() output %s does not match expected signature %s", signature, expectedSignature)
	}
}

func TestVerifySignature(t *testing.T) {
	message := "Hello World!"
	signature := "0x2da71721e3fbb58b0a2351ba5e8ac0fd0ac4d57818f3f762c0f424e7dc6a1de92ca49748fe677d9c60578fd9104dea015ad456a984af187ce5dcdc24c9800fb400"
	address := "0x96216849c49358B10257cb55b28eA603c874b05E"

	valid := utils.VerifySignature(message, signature, address)

	if !valid {
		t.Error("VerifySignature() failed (match == 'false')")
	}
}
