import { Hono } from 'hono'
import { PrismaClient, Prisma } from '@prisma/client'
import { serve } from "@hono/node-server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HTTPException } from 'hono/http-exception';

const app = new Hono()
const prisma = new PrismaClient()

// default landing
app.get("/", (c) => {
  return c.text("Hello, world!");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

// Signup endpoint
app.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return c.json({ error: "Email already registered" }, 400);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return c.json(newUser, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Login endpoint
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Check for the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
    };
    const token = jwt.sign(payload, JWT_SECRET);

    return c.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
});

// Authentication middleware
const authMiddleware = async (c, next) => {
  const token = c.req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    throw new HTTPException(401, { message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.req.user = decoded;
    await next();
  } catch (error) {
    throw new HTTPException(401, { message: "Failed to authenticate token" });
  }
};

// Create a new Pokémon
app.post('/pokemon', async (c) => {
  try {
    const { name, type, height, weight, description } = await c.req.json();

    const pokemon = await prisma.pokemon.create({
      data: {
        name,
        type,
        height,
        weight,
        description,
      },
    });

    return c.json({ message: `${pokemon.name} created successfully` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return c.json({ message: "Pokemon already exists" });
      }
    }
    console.error(e);
    return c.json({ message: "An error occurred" }, 500);
  }
});

// Retrieve all Pokémon
app.get('/pokemon', async (c) => {
  try {
    const allPokemon = await prisma.pokemon.findMany();
    return c.json(allPokemon);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get a specific Pokémon by ID
app.get('/pokemon/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const pokemon = await prisma.pokemon.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pokemon) {
      return c.json({ error: "Pokemon not found" }, 404);
    }

    return c.json(pokemon);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update a Pokémon by ID
app.put('/pokemon/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const { name, type, height, weight, description } = await c.req.json();

    const updatedPokemon = await prisma.pokemon.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        height,
        weight,
        description,
      },
    });

    return c.json(updatedPokemon);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete a Pokémon by ID
app.delete('/pokemon/:id', async (c) => {
  try {
    const { id } = c.req.param();

    await prisma.pokemon.delete({
      where: { id: parseInt(id) },
    });

    return c.json({ message: "Pokemon deleted successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create a caught Pokémon entry
app.post('/caught_pokemon', authMiddleware, async (c) => {
  try {
    const { pokemonId } = await c.req.json();
    const userId = c.req.User.sub;

    const caughtPokemon = await prisma.caught_pokemon.create({
      data: {
        pokemonId,
        userId,
      },
    });

    return c.json(caughtPokemon);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Retrieve all caught Pokémon
app.get('/caught_pokemon', async (c) => {
  try {
    const caughtPokemon = await prisma.caught_pokemon.findMany();
    return c.json(caughtPokemon);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get a specific caught Pokémon by ID
app.get('/caught_pokemon/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const caughtPokemon = await prisma.caught_pokemon.findUnique({
      where: { id: parseInt(id) },
    });

    if (!caughtPokemon) {
      return c.json({ error: "Caught Pokemon not found" }, 404);
    }

    return c.json(caughtPokemon);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete a caught Pokémon by ID
app.delete('/caught_pokemon/:id', authMiddleware, async (c) => {
  try {
    const { id } = c.req.param();
    const userId = c.req.User.sub;

    const caughtPokemon = await prisma.caught_pokemon.findUnique({
      where: { id: parseInt(id) },
    });

    if (!caughtPokemon || caughtPokemon.userId !== userId) {
      return c.json({ error: "Caught Pokemon not found or not authorized" }, 404);
    }

    await prisma.caught_pokemon.delete({
      where: { id: parseInt(id) },
    });

    return c.json({ message: "Caught Pokemon deleted successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

serve({
  fetch: app.fetch,
  port,
});
