package main

import (
	"net/http"
	"fmt"
	"io"
)

func main() {
	resp, err := http.Get("http://127.0.0.1:1323")
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	fmt.Println(string(body))
	fmt.Println(err)
}