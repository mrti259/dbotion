all: install test

install:
	npm install

test: .env
	npm test

.env:
	cp .env.example .env

format:
	npm run format