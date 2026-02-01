FROM node:18-alpine

# Install fontconfig and fonts for sharp image processing
RUN apk add --no-cache fontconfig ttf-dejavu

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
