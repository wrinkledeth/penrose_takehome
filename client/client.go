package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"penrose_takehome/utils"

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
	return string(body)
}

func main() {
	// load key pair
	loadDotenv()
	privKey := os.Getenv("PRIVATE_KEY")
	// fmt.Println(privKey)
	pubKey := "0xd9ae60EE41D999562eDD101E2096D38D1C19F982"

	message := getMessage() // get random message
	fmt.Println("GET /get_message: " + message)

	signature := utils.SignMessage(message, privKey)      //sign message
	result := verifySignature(pubKey, signature, message) //verify signature
	fmt.Print("POST /verify: " + result + "\n")
}
