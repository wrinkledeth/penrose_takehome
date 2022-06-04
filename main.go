package main

import (
	"fmt"
	"net/http"
	"penrose_takehome/utils"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

// func getMessage(ctx echo.Context) error { // get random message
// 	randomMessage := utils.RandSeq() //32 character random string
// 	return ctx.String(http.StatusOK, randomMessage)
// }

// func verify(ctx echo.Context) error { // verify signature
// 	address := ctx.FormValue("address")
// 	signedMessage := ctx.FormValue("signedMessage")
// 	message := ctx.FormValue("message")

// 	result := utils.VerifySignature(message, signedMessage, address)
// 	return ctx.String(http.StatusOK, result)
// }

func startHTTPServer() {
	e := echo.New() // create new echo instance

	e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))

	// Get new message
	e.GET("/get_message", func(c echo.Context) error {
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   0,
			HttpOnly: false,
			Secure:   true,
		}
		randomMessage := utils.RandSeq() //32 character random string
		sess.Values["message"] = randomMessage
		sess.Save(c.Request(), c.Response())
		return c.String(http.StatusOK, randomMessage)
	})

	// Get previous message from session
	e.GET("/session_message", func(c echo.Context) error {
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}

		message := sess.Values["message"].(string)

		return c.String(http.StatusOK, message)
	})

	// Verify signature, feching message from session
	e.POST("/verify", func(c echo.Context) error { // verify signature
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}

		address := c.FormValue("address")
		signedMessage := c.FormValue("signedMessage")
		message := sess.Values["message"].(string)
		fmt.Println("message!!!!: ", message)

		result := utils.VerifySignature(message, signedMessage, address)
		return c.String(http.StatusOK, result)
	})

	// e.GET("/get_message", getMessage)
	// e.POST("/verify", verify)

	e.Logger.Fatal(e.Start(":1323")) // start server on port 1323
}

func main() {
	startHTTPServer()
}
