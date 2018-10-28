
kafka:
	docker run --rm -p 2181:2181 -p 9092:9092 --name kafka -e ADVERTISED_HOST='127.0.0.1' -e ADVERTISED_PORT=9092 spotify/kafka