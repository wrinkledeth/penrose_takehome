package main

import (
	"fmt"
	"net/http"
	"penrose_takehome/utils"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func startHTTPServer() {
	e := echo.New() // create new echo instance

	e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))

	// Get new message
	e.GET("/get_message", func(c echo.Context) error {
		fmt.Println("GET received...")
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
		fmt.Println("Message Generated: ", randomMessage)
		sess.Values["message"] = randomMessage
		sess.Save(c.Request(), c.Response())
		return c.String(http.StatusOK, randomMessage)
	})

	// Verify signature, feching message from session
	e.POST("/verify", func(c echo.Context) error { // verify signature
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}
		fmt.Println("\nPOST received...")
		address := c.FormValue("address")
		signedMessage := c.FormValue("signedMessage")
		message := sess.Values["message"].(string)
		fmt.Println("Session Stored Message: ", message)
		result := utils.VerifySignature(message, signedMessage, address)
		return c.String(http.StatusOK, result)
	})

	e.Logger.Fatal(e.Start(":1323")) // start server on port 1323
}

func main() {
	startHTTPServer()
}
