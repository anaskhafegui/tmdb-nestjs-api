import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import helmet from "helmet";

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add security headers
    helmet()(req, res, next);

    // Add CORS headers
    res.header(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGINS || "*"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Add XSS protection
    res.header("X-XSS-Protection", "1; mode=block");
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "DENY");

    next();
  }
}
