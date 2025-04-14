 CREATE DATABASE healthy_foodie;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20)
);

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    seller_id INTEGER REFERENCES users(id)
);

CREATE TABLE ingredients (
    recipe_id INTEGER REFERENCES recipes(id),
    name VARCHAR(255),
    measurement VARCHAR(255)
);