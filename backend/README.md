Assignment: Authentication & Authorization Flow

Build a basic authentication and authorization system using Express.js.

For now, do not use a database or create any models. Store users temporarily in an array in your application.

Requirements

1. Register

Create a registration endpoint that:

* Accepts a user’s name, email, password, and role.
* Validates the input.
* Hashes the password using bcrypt.
* Stores the user temporarily in an array.
* Prevents registration with an email that already exists.

2. Login

Create a login endpoint that:

* Accepts email and password.
* Checks if the user exists.
* Compares the password using bcrypt.
* Generates a JWT when login is successful.
* Returns the JWT to the user.

3. Protected Route

Create a protected route that:

* Requires a valid JWT.
* Rejects requests without a token.
* Rejects requests with an invalid or expired token.
* Allows authenticated users to access the route.

Example:

GET /api/profile

4. Admin-Only Route

Create another protected route that can only be accessed by users with the admin role.

Example:

GET /api/admin/dashboard

A normal user should receive:

403 Forbidden

when trying to access the admin route.

Required Middleware

Create:

* Authentication middleware — verifies the JWT and identifies the logged-in user.
* Authorization middleware — checks whether the authenticated user has the required role.

Expected Flow

REGISTER
   ↓
Validate input
   ↓
Hash password
   ↓
Store user temporarily in array
   ↓
LOGIN
   ↓
Verify email & password
   ↓
Generate JWT
   ↓
Client sends JWT
   ↓
Authentication Middleware
   ↓
Verify JWT
   ↓
Authorization Middleware
   ↓
Check User Role
   ↓
Protected Route / Admin Route



The goal of this assignment is to understand how authentication, JWT, middleware, and role-based authorization work before introducing databases.