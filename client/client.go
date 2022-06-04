package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"penrose_takehome/utils"

	"github.com/joho/godotenv"
)

func loadEnv(path string) {
	// Load .env file if it exists
	err := godotenv.Load(path)
	if err != nil {
		fmt.Println("Error loading .env file")
	}
}

func getMessage() (string, *http.Cookie) {
	resp, err := http.Get("http://127.0.0.1:1323/get_message")
	if err != nil {
		fmt.Println("Get Error")
	}
	defer resp.Body.Close()

	cookie := resp.Cookies()[0]      // get cookie from response
	body, _ := io.ReadAll(resp.Body) // read response body

	return string(body), cookie
}

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

func main() {
	// load key pair
	loadEnv("../.env")
	privKey := os.Getenv("PRIVATE_KEY")
	pubKey := os.Getenv("PUBLIC_KEY")

	// get random message and store session cookie
	message, cookie := getMessage() // get random message
	fmt.Println("GET /get_message: " + message)

	// verify signature, maintain session using cookie
	signature := utils.SignMessage(message, privKey) //sign message
	result := postVerify(pubKey, signature, cookie)  //verify signature
	fmt.Print("POST /verify: " + result + "\n")
}
