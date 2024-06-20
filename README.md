## Pokémon API

![alt text](image/Pokemon.avif)

### Introduction
This is a Pokémon API built using the Hono framework with Prisma as the ORM. The API allows users to sign up, log in, create Pokémon, and manage caught Pokémon entries. It also includes JWT-based authentication.

### Installation

    git clone https://github.com/Kinleyjigs/02230313_WEB102_PA2.git

### Install the dependencies

    npm install

### Environment Variables
Create a .env file in the root directory and add the following environment variables:

    DATABASE_URL=your_database_url
    JWT_SECRET=your_jwt_secret

### Running the Server

    npm run dev 

### Running the database

    npx prisma studio

## API Endpoints
### Signup
**POST** - URL: http://localhost:3000/signup

#### Request Body (JSON)

    {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
    }


### Login
**POST**- URL:  http://localhost:3000/login

#### Request Body (JSON):

    {
    "email": "user@example.com",
    "password": "password123"
    }


### Create a New Pokémon
**POST**- URL: http://localhost:3000/pokemon

#### Request Body (JSON):

    {
    "name": "Pikachu",
    "type": "Electric",
    "height": 0.4,
    "weight": 6.0,
    "description": "A yellow electric Pokémon"
    }


#### RESPONSE 

    {
    "message": "Pikachu created successfully"
    }

### Retrieve All Pokémon
**GET**- URL: http://localhost:3000/pokemon

#### RESPONSE 

    [
    {
        "id": 1,
        "name": "Pikachu",
        "type": "Electric",
        "height": 0.4,
        "weight": 6.0,
        "description": "A yellow electric Pokémon"
    },
    ...
    ]


### Get a Specific Pokémon by ID
**GET**- URL: http://localhost:3000/pokemon/1

#### Response:

    {
    "id": 1,
    "name": "Pikachu",
    "type": "Electric",
    "height": 0.4,
    "weight": 6.0,
    "description": "A yellow electric Pokémon"
    }

### Update a Pokémon by ID
**PUT**- URL: http://localhost:3000/pokemon/1

#### Request Body (JSON):

    {
    "name": "meowth",
    "type": "Electric",
    "height": 0.8,
    "weight": 30.0,
    "description": "An evolved electric Pokémon"
    }

#### Response:

    {
    "id": 1,
    "name": "Raichu",
    "type": "Electric",
    "height": 0.8,
    "weight": 30.0,
    "description": "An evolved electric Pokémon"
    }

### Delete a Pokémon by ID
**DELETE**- URL: http://localhost:3000/pokemon/1

#### Response:

    {
    "message": "Pokemon deleted successfully"
    }


### Create a Caught Pokémon Entry
**POST**- URL: http://localhost:3000/caught_pokemon

#### Request Body (JSON):

    {
    "pokemonId": 1
    }

#### Response:

    {
    "id": 1,
    "pokemonId": 1,
    "userId": 1
    }

### Retrieve All Caught Pokémon
**GET**- URL: http://localhost:3000/caught_pokemon

### Delete a Caught Pokémon by ID
**DELETE**- URL: http://localhost:3000/caught_pokemon/1

#### Response:

    {
    "message": "Caught Pokemon deleted successfully"
    }

### Authentication Middleware
The authMiddleware function ensures that the request has a valid JWT token in the Authorization header. If the token is missing or invalid, a 401 Unauthorized error is thrown.


### Error Handling
The API uses HTTPException from Hono for error handling:

- 400 Bad Request: Missing fields or email already registered.
- 401 Unauthorized: Authentication fails (missing/invalid token).
- 404 Not Found: Resource not found.
- 500 Internal Server Error: Unexpected server errors.
