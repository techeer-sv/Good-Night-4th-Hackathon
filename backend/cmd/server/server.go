package server

import (
	"fmt"
	"log"

	"github.com/printSANO/hackathon4/cmd/database"
	"github.com/printSANO/hackathon4/cmd/handlers"
	"github.com/printSANO/hackathon4/cmd/repositories"
	"github.com/printSANO/hackathon4/cmd/services"
)

func StartServer(port string) {
	db := database.SetupDatabase()
	defer db.Close()

	redisClient := database.NewRedisClient()
	defer redisClient.Client.Close()

	err := database.MigrateSQLFile("cmd/database/migrations/init.sql", db)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	repo := repositories.NewRepository(db, redisClient.Client)

	service := services.NewService(repo)

	handler := handlers.NewHandler(service)

	router := setupRouter(handler)
	err = router.Run(fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
