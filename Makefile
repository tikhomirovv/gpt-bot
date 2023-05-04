build:
	docker build -t gpt-bot .

run:
	docker run -d -p 3000:3000 --name gpt-bot --rm gpt-bot