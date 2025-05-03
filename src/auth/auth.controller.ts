import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { WrapperResponse } from "../common/dtos/wrapper-response.dto";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@ApiTags("Authentication")
@ApiExtraModels(WrapperResponse)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new user",
    description: "Creates a new user account and returns a JWT access token",
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example1: {
        value: {
          email: "user@example.com",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User successfully registered",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              properties: {
                access_token: {
                  type: "string",
                  example:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad request - Invalid input data",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              properties: {
                statusCode: { type: "number", example: 400 },
                message: { type: "array", items: { type: "string" } },
                error: { type: "string", example: "Bad Request" },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Conflict - Email already exists",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              properties: {
                statusCode: { type: "number", example: 409 },
                message: { type: "string", example: "Email already exists" },
                error: { type: "string", example: "Conflict" },
              },
            },
          },
        },
      ],
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      status: HttpStatus.CREATED,
      message: "User registered successfully",
      result,
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login user",
    description: "Authenticates a user and returns a JWT access token",
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        value: {
          email: "user@example.com",
          password: "password123",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User successfully logged in",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              properties: {
                access_token: {
                  type: "string",
                  example:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad request - Invalid input data",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              properties: {
                statusCode: { type: "number", example: 400 },
                message: { type: "array", items: { type: "string" } },
                error: { type: "string", example: "Bad Request" },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized - Invalid credentials",
    schema: {
      allOf: [
        { $ref: getSchemaPath(WrapperResponse) },
        {
          properties: {
            result: {
              properties: {
                statusCode: { type: "number", example: 401 },
                message: { type: "string", example: "Invalid credentials" },
                error: { type: "string", example: "Unauthorized" },
              },
            },
          },
        },
      ],
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      status: HttpStatus.OK,
      message: "User logged in successfully",
      result,
    };
  }
}
