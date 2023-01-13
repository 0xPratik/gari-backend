FROM node:16.13.2

WORKDIR /home/ubuntu/nft-badge-service

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD npm run dev --env $Build_Env && tail -f /dev/null
