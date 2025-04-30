import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { sanitize } from "sanitize-html";
import xss from "xss";

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize params
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeString(value: string): string {
    // First use xss to prevent XSS attacks
    let sanitized = xss(value);
    // Then use sanitize-html to clean HTML content
    sanitized = sanitize(sanitized, {
      allowedTags: [], // No HTML tags allowed by default
      allowedAttributes: {}, // No attributes allowed by default
    });
    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    const sanitized: any = {};
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        sanitized[key] = this.sanitizeString(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
}
