FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV CORTEX_PREFIX='CORTEX'
ENV LONG_TOKEN_SECRET='Y+r2#q%$NQ*A@fwH'
ENV SHORT_TOKEN_SECRET='MW3C2H&d9VsLP^qV'
ENV NACL_SECRET='M4UHkV+hEeT6z(Zq'
ENV REDIS_URI='redis://redis:6379'
ENV MONGO_URI='mongodb://mongo:27017/axion'

CMD ["npm", "start"]
