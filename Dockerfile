# Use Node.js 18 LTS como base
FROM node:18-alpine

# Instalar curl para health check
RUN apk add --no-cache curl

# Definir diretório de trabalho
WORKDIR /app

# Build arguments para configurações
ARG NODE_ENV=production
ARG PORT=3000
ARG JWT_SECRET=medup-secret-key-change-in-production
ARG NODE_TLS_REJECT_UNAUTHORIZED=0
ARG TRUST_PROXY=true
ARG CORS_ORIGIN=*
ARG CORS_CREDENTIALS=false
ARG SSL_VERIFY=false
ARG FORWARDED_PROTO=https

# Definir variáveis de ambiente
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT
ENV JWT_SECRET=$JWT_SECRET
ENV NODE_TLS_REJECT_UNAUTHORIZED=$NODE_TLS_REJECT_UNAUTHORIZED
ENV TRUST_PROXY=$TRUST_PROXY
ENV CORS_ORIGIN=$CORS_ORIGIN
ENV CORS_CREDENTIALS=$CORS_CREDENTIALS
ENV SSL_VERIFY=$SSL_VERIFY
ENV FORWARDED_PROTO=$FORWARDED_PROTO

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
