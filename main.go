package main

import (
	"net/http"
	"penrose_takehome/utils"

	"github.com/labstack/echo"
)

func getMessage(c echo.Context) error {
	randomMessage := utils.RandSeq() //32 character random string
	return c.String(http.StatusOK, randomMessage)
}

func verify(c echo.Context) error {
	address := c.FormValue("address")
	signedMessage := c.FormValue("signedMessage")
	message := c.FormValue("message")

	result := utils.VerifySignature(message, signedMessage, address)
	return c.String(http.StatusOK, result)
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
