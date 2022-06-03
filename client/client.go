package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"

	"penrose_takehome/utils"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/joho/godotenv"
)

func loadDotenv() {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}
}

func getMessage() string {
	resp, err := http.Get("http://127.0.0.1:1323/get_message")
	if err != nil {
		fmt.Println("Get Error") // handle error
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
	return string(body)
}

func verifySignature(address string, signedMessage string, message string) string {
	data := url.Values{
		"address":       {address},
		"signedMessage": {signedMessage},
		"message":       {message},
	}

	resp, err := http.PostForm("http://127.0.0.1:1323/verify", data)
	if err != nil {
		fmt.Println("Post Error") // handle error
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
	return string(body)
}

func main() {
	loadDotenv()
	privKey := os.Getenv("PRIVATE_KEY")
	// pubKey := "0xd9ae60EE41D999562eDD101E2096D38D1C19F982"
	message := getMessage()
	signature := utils.SignMessage(message, privKey)
	fmt.Println("signature hex: ", hexutil.Encode(signature))
	verifySignature("hi", "hi")
}
