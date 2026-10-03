


Restaurant Management System — Full-Stack Assessment

Build a Restaurant Management System with a backend API and a simple frontend.

The project should demonstrate your understanding of Express.js, REST APIs, PostgreSQL, database relationships, CRUD operations, and connecting a frontend to a backend API.

Backend

Build the backend using:

* Node.js
* Express.js
* PostgreSQL

Your backend should provide REST API endpoints for:

Users

* Create user
* Get users
* Get a user
* Update user
* Delete user

Categories

* Create category
* Get categories
* Get a category
* Update category
* Delete category

Menu Items

* Create menu item
* Get menu items
* Get a menu item
* Update menu item
* Delete menu item

Each menu item should belong to a category.

Orders

* Create order
* Get orders
* Get an order
* Update order
* Delete order

Order Items

An order should be able to contain multiple menu items.

For example:

Order #1
 ├── Burger × 2
 ├── Pizza × 1
 └── Coke × 2

The order items must be properly connected to the order and the menu items in PostgreSQL.

Database

Create a PostgreSQL database with the required tables and relationships.

At minimum, your database should contain:

users
categories
menu_items
orders
order_items

Use:

* Primary keys
* Foreign keys
* NOT NULL
* UNIQUE
* DEFAULT
* Appropriate data types

Insert sample data into the database.

Make sure the relationships between the tables work correctly.

Frontend

Build a simple frontend running locally that consumes your REST API.

You may use:

* HTML
* CSS
* JavaScript

or a frontend framework such as React if you have learned it.

The frontend does not need to be complicated.

It should allow a user to interact with the main features of your restaurant system.

At minimum, the frontend should have:

Menu

Display the available menu items.

Show information such as:

Food Name
Description
Price
Category

Categories

Allow users to view menu items by category.

Orders

Allow a user to create an order by selecting menu items and quantities.

Display the order and its items.

Order Management

Display existing orders and their details.

The frontend must obtain its data from your Express API.

Do not hard-code the restaurant data directly into the frontend.

The flow should be:

PostgreSQL
     ↓
Express REST API
     ↓
Frontend
     ↓
User

API and Frontend Integration

Your frontend should make requests to your backend API using HTTP requests such as:

GET
POST
PUT
DELETE

For example:

Frontend
   ↓
GET /api/menu-items
   ↓
Express API
   ↓
PostgreSQL
   ↓
Response
   ↓
Frontend displays menu

Requirements

Your application should:

* Connect Express to PostgreSQL.
* Perform CRUD operations through the API.
* Use database relationships correctly.
* Use foreign keys.
* Validate incoming data.
* Return appropriate HTTP status codes.
* Handle errors properly.
* Store database credentials in .env.
* Connect the frontend to the backend API.
* Display database information dynamically on the frontend.

Monday Presentation

The project will be presented in class on Monday.

During your presentation, you should demonstrate:

1. Your PostgreSQL database and tables.
2. The relationships between your tables.
3. Your Express API.
4. Your API endpoints.
5. Your frontend.
6. Creating and viewing menu items.
7. Creating an order.
8. Viewing an order and its items.
9. How the frontend communicates with the backend.
10. How data flows from PostgreSQL → API → frontend.

You should be able to explain the code and database structure you created.

Submission

Submit your complete project before the Monday presentation, including:

* Backend source code.
* Frontend source code.
* SQL/database structure .
* Postman/Thunder Client collection.
* README with instructions for running the project locally.

Important: The frontend does not need to look professional or contain advanced features. The main goal is to demonstrate that your frontend, Express API, and PostgreSQL database work together as one system.
