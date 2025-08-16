package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/printSANO/hackathon4/cmd/auth"
	"github.com/printSANO/hackathon4/cmd/handlers"
	"github.com/printSANO/hackathon4/cmd/logger"
	"github.com/printSANO/hackathon4/config"
	docs "github.com/printSANO/hackathon4/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func setupRouter(handler *handlers.Handler) *gin.Engine {
	username := config.GetEnvVarAsString("SWAGGER_USERNAME", "admin")
	password := config.GetEnvVarAsString("SWAGGER_PASSWORD", "admin")
	authUsers := gin.Accounts{
		username: password,
	}

	router := gin.Default()
	router.Use(gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Cookie", "X-Requested-With", "Accept"},
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"},
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	}))

	router.Use(logger.JsonLoggerMiddleware())

	docs.SwaggerInfo.Title = "Hackathon4 API"
	docs.SwaggerInfo.Description = "Hackathon4 API"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.BasePath = "/api/v1"

	apiGroup := router.Group("/api/v1")
	{
		seatGroup := apiGroup.Group("/seats")
		seatGroup.Use(auth.UserTokenMiddleware())
		{
			seatGroup.GET("/seats-test", handler.SeatHandler.GetSeats)
			seatGroup.GET("", handler.SeatHandler.GetSeats)                    // 전체 좌석 조회
			seatGroup.GET("/:id", handler.SeatHandler.GetSeat)                 // 특정 좌석 조회
			seatGroup.POST("", handler.SeatHandler.CreateSeat)                 // 내부용 좌석 생성
			seatGroup.POST("/reserve", handler.SeatHandler.ReserveSeat)        // 예약 생성
			seatGroup.DELETE("/unreserve", handler.SeatHandler.UnreserveSeat)  // 예약 취소
			seatGroup.POST("/buy", handler.SeatHandler.BuySeat)                // 좌석 구매 생성
			seatGroup.DELETE("/cancel", handler.SeatHandler.CancelReservation) // 좌석 구매 취소
			seatGroup.DELETE("/:id", handler.SeatHandler.DeleteSeat)           // 내부용 좌석 삭제
		}
	}
	swagger := apiGroup.Group("/swagger", gin.BasicAuth(authUsers))
	swagger.GET("/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	return router
}
