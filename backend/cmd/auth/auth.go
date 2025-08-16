package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GenerateToken creates a secure random token
func GenerateToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// UserTokenMiddleware ensures a user_token cookie exists
func UserTokenMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log the request for debugging
		fmt.Printf("Auth middleware: %s %s\n", c.Request.Method, c.Request.URL.Path)
		fmt.Printf("Origin: %s\n", c.GetHeader("Origin"))
		fmt.Printf("Cookie header: %s\n", c.GetHeader("Cookie"))

		token, err := c.Cookie("hackathon4_token")

		if err != nil {
			// Cookie missing -> create a new token
			fmt.Printf("No cookie found, generating new token\n")
			token, err := GenerateToken()
			if err != nil {
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "could not generate token",
				})
				return
			}

			fmt.Printf("Setting new cookie: %s\n", token)
			// Set cookie with more permissive settings for localhost development
			c.SetCookie(
				"hackathon4_token",
				token,
				6*60*60, // 6 hours
				"/",
				"",    // Empty domain for localhost
				false, // Secure (false for localhost)
				true,  // HttpOnly (false to allow JS access for debugging)
			)
		} else {
			fmt.Printf("Found existing cookie: %s\n", token)
		}

		// Always set the token in context (either from cookie or newly generated)
		c.Set("hackathon4_token", token)
		c.Next()
	}
}
