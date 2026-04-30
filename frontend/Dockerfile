## Imagem do frontend: instala dependencias e sobe o Vite em modo de desenvolvimento.
FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
