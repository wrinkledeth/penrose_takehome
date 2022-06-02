package main

import (
	"context"
	"fmt"
	"log"
	"math"
	"math/big"
	"net/http"
	"os"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func start_http_server() {
	e := echo.New()
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.Logger.Fatal(e.Start(":1323"))
}

func get_geth_client() *ethclient.Client {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
	}

	// Get provider URL
	provider := os.Getenv("GOERLI_PROVIDER")
	fmt.Println("provider: ", provider)

	// Start GETH client
	client, err := ethclient.Dial(provider)
	if err != nil {
		fmt.Println(err)
	}

	return client
}

func get_balance(address string) {
	client := get_geth_client()

	// Get balance
	balance, err := client.BalanceAt(context.Background(), common.HexToAddress(address), nil)
	if err != nil {
		log.Fatal(err)
	}

	fbalance := new(big.Float)
	fbalance.SetString(balance.String())
	ethValue := new(big.Float).Quo(fbalance, big.NewFloat(math.Pow10(18)))

	fmt.Println("Balance: ", ethValue)
}

func main() {

	address := "0xd9ae60EE41D999562eDD101E2096D38D1C19F982"
	get_balance(address)

	// privateKey, err := crypto.HexToECDSA("fad9c8855b740a0b7ed4c221dbad0f33a83a49cad6b3fe8d5817ac83d38b6a19")
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// start_http_server()
	// echo_server()

}
