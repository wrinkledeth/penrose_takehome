package main

import (
	"fmt"
	"net/http"
	"os"
	"penrose_takehome/utils"

	"github.com/joho/godotenv"
	"github.com/labstack/echo"
)

func loadDotenv() {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}
}

func getMessage(c echo.Context) error {
	return c.String(http.StatusOK, utils.RandSeq())
}

func verify(c echo.Context) error {
	// Get name and email
	address := c.FormValue("address")
	signedMessage := c.FormValue("signedMessage")
	message := c.FormValue("message")
	// out := utils.VerifySignature(message, signature, pubKey)
	return c.String(http.StatusOK, "address:"+address+", signedMessage:"+signedMessage+", message:"+message)
}

func startHTTPServer() {
	//! Start HTTP server (hello world code, needs work)
	e := echo.New()
	e.GET("/get_message", getMessage)
	e.POST("/verify", verify)
	e.Logger.Fatal(e.Start(":1323"))
}

func main() {
	// startHTTPServer()
	// // Load .env file and get public / private key pair
	loadDotenv()
	privKey := os.Getenv("GOERLI_PRIVATE_KEY")
	pubKey := "0xd9ae60EE41D999562eDD101E2096D38D1C19F982"

	//Sign Message with Priv Key
	message := "hello"
	signature := utils.SignMessage(message, privKey)
	// fmt.Println("signature hex: ", hexutil.Encode(signature))
	fmt.Println()

	// Verify Signature
	out := utils.VerifySignature(message, signature, pubKey)
	fmt.Println("verifySignature: ", out)
}
