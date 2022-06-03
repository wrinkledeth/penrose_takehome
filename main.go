package main

import (
	"net/http"
	"penrose_takehome/utils"
	"strconv"

	"github.com/labstack/echo"
)

func getMessage(c echo.Context) error {
	return c.String(http.StatusOK, utils.RandSeq())
}

func verify(c echo.Context) error {
	// Get name and email
	address := c.FormValue("address")
	signedMessage := c.FormValue("signedMessage")
	message := c.FormValue("message")
	result := utils.VerifySignature(message, signedMessage, address)
	return c.String(http.StatusOK, strconv.FormatBool(result))
}

func startHTTPServer() {
	e := echo.New()
	e.GET("/get_message", getMessage)
	e.POST("/verify", verify)
	e.Logger.Fatal(e.Start(":1323"))
}

func main() {
	startHTTPServer()
}
