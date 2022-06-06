package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"penrose_takehome/utils"
)

func getMessage(targetURL string) (string, *http.Cookie) {
	resp, err := http.Get(targetURL + "/get_message")
	if err != nil {
		fmt.Println("Get Error")
	}
	defer resp.Body.Close()

	cookie := resp.Cookies()[0]      // get cookie from response
	body, _ := io.ReadAll(resp.Body) // read response body

	return string(body), cookie
}

func postVerify(targetURL string, address string, signedMessage string, cookie *http.Cookie) string {
	data := url.Values{
		"address":       {address},
		"signedMessage": {signedMessage},
	}

	postBody := bytes.NewBufferString(data.Encode())                                 // url encoded data in body
	req, _ := http.NewRequest("POST", targetURL+"/verify", postBody)                 // create POST request
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded; param=value") // header to specify url encoded data
	req.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})              // add cookie to request to keep session

	client := &http.Client{}
	resp, _ := client.Do(req)
	body, _ := io.ReadAll(resp.Body)

	return string(body)
}

func main() {
	// parse command line arguments
	urlPtr := flag.String("url", "http://127.0.0.1:1323", "URL of the API Server")
	flag.Parse()
	targetURL := *urlPtr

	// load key pair
	utils.LoadEnv("../.env")
	privKey := os.Getenv("PRIVATE_KEY")
	pubKey := os.Getenv("PUBLIC_KEY")

	// get random message and grab session cookie
	resp_json, cookie := getMessage(targetURL) // get random message
	fmt.Print("GET /get_message: " + resp_json)

	// Pull out message from json response
	var resp_map map[string]interface{}
	json.Unmarshal([]byte(resp_json), &resp_map)
	message := resp_map["message"].(string)

	// sign message
	signature := utils.SignMessage(message, privKey)

	// verify signature, maintain session using cookie
	result := postVerify(targetURL, pubKey, signature, cookie)
	fmt.Print("POST /verify: " + result + "\n")
}
