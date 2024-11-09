# Default Docker Compose file (can be overridden)
COMPOSE_FILE := docker-compose.dev.yml

# Target for running docker-compose up
up:
	docker-compose -f $(COMPOSE_FILE) up

# Optional target to specify a different compose file
up-file:
	@read -p "Enter the compose file (default: $(COMPOSE_FILE)): " FILE; \
	if [ -z "$$FILE" ]; then FILE=$(COMPOSE_FILE); fi; \
	docker-compose -f $$FILE up

# Target for running docker-compose up in detached mode
up-detached:
	docker-compose -f $(COMPOSE_FILE) up -d

# Target to stop the containers
down:
	docker-compose -f $(COMPOSE_FILE) down

# Target to view logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f
