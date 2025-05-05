import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { sanitize } from "sanitize-html";
import xss from "xss";

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === "string") {
      return this.sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
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
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (typeof item === "string") {
          return this.sanitizeString(item);
        } else if (typeof item === "object" && item !== null) {
          return this.sanitizeObject(item);
        }
        return item;
      });
    }

    // Handle regular objects
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
