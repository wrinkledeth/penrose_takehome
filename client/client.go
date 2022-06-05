package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"penrose_takehome/utils"
)

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
	utils.LoadEnv("../.env")
	privKey := os.Getenv("PRIVATE_KEY")
	pubKey := os.Getenv("PUBLIC_KEY")
	privKey = "poop"

	// get random message and grab session cookie
	resp_json, cookie := getMessage() // get random message
	fmt.Print("GET /get_message: " + resp_json)

	// Pull out message from json response
	var resp_map map[string]interface{}
	json.Unmarshal([]byte(resp_json), &resp_map)
	message := resp_map["message"].(string)

	// sign message
	signature := utils.SignMessage(message, privKey)

	// verify signature, maintain session using cookie
	result := postVerify(pubKey, signature, cookie)
	fmt.Print("POST /verify: " + result + "\n")
}
