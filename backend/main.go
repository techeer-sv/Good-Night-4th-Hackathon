package main

import (
	"github.com/printSANO/hackathon4/cmd/server"
	"github.com/printSANO/hackathon4/config"
)

func main() {
	config.LoadEnvFile(".env")

	port := config.GetEnvVarAsString("PORT", "8080")
	server.StartServer(port)
}
