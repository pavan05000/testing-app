FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV PORT=8301
RUN npm run build
RUN npm install -g serve
EXPOSE 8301
#CMD["npm", "start"]
CMD ["serve", "-s", "dist/angularmaterial", "-l", "8301"]
