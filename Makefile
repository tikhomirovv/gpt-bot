dev:
	yarn dev
up:
	docker-compose -f ./docker-compose.yml up -d
stop:
	docker-compose -f ./docker-compose.yml stop
build:
	docker build -t gpt-bot .
run:
	docker run -d -p 3000:3000 --name gpt-bot --network gpt-bot --rm gpt-bot