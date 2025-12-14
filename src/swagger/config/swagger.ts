import swaggerJsdoc, { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  // OpenAPI 명세에 대한 기본 정보 정의 (OpenAPI Object)
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Torium Server API 문서",
      version: "1.0.0",
      description: "Torium project의 Backend Server API 문서",
    },
    servers: [
      {
        url: "https://torium.kro.kr/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access Token (JWT)이 필요합니다.",
        },
      },
      schemas: {
        Default: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: [
    // 개발 환경
    "./src/swagger/schemas/*/*.yaml",
    "./src/swagger/apis/*.yaml",

    // 배포 환경
    "./dist/presentation/routes/*.js",
    "./dist/swageger/schemas/*/*.js",
    "./dist/swageger/schemas/*.js",
  ],
};

const specs = swaggerJsdoc(swaggerOptions);
export default specs;
