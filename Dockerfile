# 1. 베이스 이미지(계층 1)
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 매니페스트 복사(의존성 설치를 위한 캐시 활용)
COPY package.json package-lock.json ./

# 4. 의존성 설치 (빌드 시 사용되는 dev deps 포함)
RUN npm ci

# 5. 소스코드 복사
COPY tsconfig.json ./
COPY src ./src

# 6. TypeScript 빌드 (tsconfig에 따라 dist 생성)
RUN npm run build

# --- 이제 프로덕션 이미지를 만들기 위해 멀티스테이지 사용 ---
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 7. 프로덕션 의존성만 설치
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 8. 빌드 산출물 복사
COPY --from=builder /app/dist ./dist

# 9. 포트 문서화
EXPOSE 3000

# 10. 비루트 사용자로 실행(보안)
USER node

# 11. 기본 실행 명령
CMD ["node", "dist/app.js"]
