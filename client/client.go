package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	resp, err := http.Get("http://127.0.0.1:1323/get_message")
	if err != nil {
		fmt.Println("we got an error boys.") // handle error
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))

}
