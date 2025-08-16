.PHONY: swagger run build lint fmt dr dd ddv

swagger:
	swag init

run:
	swag init
	go run main.go

build:
	go build -o app main.go

lint:
	golangci-lint run

fmt:
	go fmt ./...

dr:
	docker compose up -d

dd:
	docker compose down

ddv:
	docker compose down -v
