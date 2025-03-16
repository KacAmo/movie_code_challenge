# Prequisites
- [nvm](https://github.com/nvm-sh/nvm)
- npm (can be installed through nvm)
- [docker and docker-compose](https://medium.com/@piyushkashyap045/comprehensive-guide-installing-docker-and-docker-compose-on-windows-linux-and-macos-a022cf82ac0b)
# Setup

## For development
- Install all the dependencies
```shell
for folder in backend/etl backend/api frontend; do cd "$folder"; nvm use; npm ci ; cd ..; done
```
- Run the tests 
```shell
for folder in backend/etl backend/api frontend; do npm t --prefix "$folder"; done
```
## For demonstration purposes
start everything locally using docker-compose
```sh
docker-compose up
```

# Component Diagram

```
┌──────────┐     ┌─────────┐      ┌──────────┐        ┌───────────┐
│          │     │         │      │          │        │           │
│          │     │         │      │          │        │           │
│API       │◄────┼Postgres │◄─────┼ETL       │◄───────┼OMDB API   │
│          │     │         │      │          │        │           │
│          │     │         │      │          │        │           │
└─────┬────┘     └─────────┘      └──────────┘        └───────────┘
      │                                                            
      │                                                            
      │                                                            
      │                                                            
      │                                                            
┌─────▼────┐                                                       
│          │                                                       
│          │                                                       
│  frontend│                                                       
│          │                                                       
│          │                                                       
└──────────┘ 
```

1. An ETL Process shall periodicall poll the data from the OMDB API and write it the database in a ready form for the API
2. The API serves the data to the frontend

The separatation of the ETL process from the API serves the purpose of separating the load for writing the data from the load serving customer requests


# TODOS
## Development process
- I would normally use linters to ensure a normalied code convention over the whole project. I normally use eslint together with prettier
- Transform into a mono-repo setup using npm workspaces and share the repository definition between ETL and API

## Backend
### Operation TODOS
#### Logging
- Replace the console.log statements with a proper logging library e.g. Pino asynchronous logging
- Use appropriate logging levels and log only errors in production
- Add ability to enable debug logging in production for troubleshooting

# Backend/API
- The search is using the postgres trigram extension together with a GIN index. The search is then performed using a ILKE operator. For more information please look into: https://www.cybertec-postgresql.com/en/postgresql-more-performance-for-like-and-ilike-statements/.
- For more complex scenarios more advanced text search technologies can be used such as opensearch or postgres full-text search.
- consider using connection pooling for postgres if need be.
