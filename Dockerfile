# 使用 Node.js 18 作為基礎映像
FROM node:18.18.2 AS builder

# RUN apt-get install python3-pip -y

# RUN pip install pymysql

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 yarn.lock 文件
COPY package.json yarn.lock ./

# 安裝應用程式相依套件
RUN yarn install

COPY . .

# 更新 prisma client
RUN npx prisma generate

RUN yarn build

# production

FROM node:18.18.2-slim AS final

WORKDIR /app

# 安裝 Python
RUN apt-get update \
    && apt-get install -y python3.10 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder ./app/build .

# 複製 package.json 和 yarn.lock 文件
COPY package.json yarn.lock ./

COPY .env .

COPY prisma/ .

RUN yarn install --production

# 更新 prisma client
RUN npx prisma generate

# 安裝 PM2 全域套件
RUN yarn global add pm2

# python 程式
# COPY python_scripts/ ./python_scripts

# 暴露端口
EXPOSE 3000

# 使用 PM2 啟動應用程序
CMD ["pm2-runtime", "start", "index.js", "--name", "Azure_Api"]
