/**
 * @file auth.middleware.ts
 * @description Middleware for JWT authentication. -- middleware for JWT authentication
 * @author @im-ushan-ikshana
 */

import { Request, Response, NextFunction } from 'express';        //import reqest, response and next function from express
import { verifyToken } from '../utils/helpers';                   //import verifyToken function from utils/helpers

/**
 * Middleware to authenticate JWT tokens.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next function to call the next middleware
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Auth headers' });

  const token = authHeader.split(' ')[1];                       // Extract token from the header -- split the header by space and get the second part 
  if (!token)                                                   // Check if token is present -- check if the token is present in the header
    return res.status(401).json({ error: 'Missing token' });    

  try {
    const decoded = verifyToken(token);                         // Verify the token -- verify the token using the verifyToken function
    (req as any).user = decoded;                                // Attach -- attach the decoded token to the request object for further use
    next();                                                     // call the next middleware in the stack
  } catch (error: any) {
    return res.status(403).json({ error: 'Invalid token' });    // If token is invalid -- if the token is invalid, return a 403 error
  }
}
