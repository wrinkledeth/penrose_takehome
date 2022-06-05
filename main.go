package main

import (
	"fmt"
	"net/http"
	"penrose_takehome/utils"
	"strconv"

	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
)

func startHTTPServer() {
	e := echo.New() // create new echo instance

	// Use session middleware for session tracking
	e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))

	// Get new message
	e.GET("/get_message", func(c echo.Context) error {
		fmt.Println("\nGET received...")

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

		// Store message in session
		sess.Values["message"] = randomMessage
		sess.Save(c.Request(), c.Response())

		// Return message to client
		return c.JSON(http.StatusOK, map[string]interface{}{
			"message": randomMessage,
		})

	})

	// Verify signature, feching message from session
	e.POST("/verify", func(c echo.Context) error { // verify signature
		sess, err := session.Get("session", c)
		if err != nil {
			return err
		}
		fmt.Println("POST received...")
		// get address and signed message from POST parameters
		address := c.FormValue("address")
		signedMessage := c.FormValue("signedMessage")

		// get message from session
		message := sess.Values["message"].(string)
		fmt.Println("Session Stored Message: ", message)

		// verify signature and return result to client
		result := utils.VerifySignature(message, signedMessage, address)
		resultStr := strconv.FormatBool(result)
		return c.JSON(http.StatusOK, map[string]interface{}{
			"verified": resultStr,
		})
	})

	e.Logger.Fatal(e.Start(":1323")) // start server on port 1323
}

func main() {
	startHTTPServer()
}
