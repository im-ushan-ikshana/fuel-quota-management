/**
 * @description: Helper functions for hashing passwords and generating JWT tokens.
 * @file helpers.ts
 * @author: @im-ushan-ikshana
 */

//import bcrypt for hashing passwords and jwt for generating tokens
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//import User type from Prisma client
import { User } from '@prisma/client';

// Load environment variables from .env file
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'; // --set a default secret key if not provided in .env file(fallback value)

// Bcrypt hashing -- Hashing passwords using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // set the salt rounds for bcrypt hashing(default is set to 10)
  return bcrypt.hash(password, saltRounds);
}

// Compare password with hash -- Compare the provided password with the hashed password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token - Generate JWT token -- Generate a JWT token for the user
export function generateToken(user: User) {
  // Provide minimal payload, e.g. user_id, email, roles
  return jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, {
    expiresIn: '1d',
  });
}

// Verify JWT token -- Verify the provided JWT token
// This function will throw an error if the token is invalid or expired
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
