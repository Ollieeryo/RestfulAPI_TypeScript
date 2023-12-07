# 使用 Node.js 18 作為基礎映像
FROM node:18.18.2

# 設定工作目錄
WORKDIR /app

# 安裝 PM2 全域套件
RUN yarn global add pm2

# 复制 package.json 和 yarn.lock 文件
# COPY package.json yarn.lock ./

# 安裝應用程式相依套件
RUN yarn install --production

# 更新 prisma client
RUN npx prisma generate


# 安装生產依賴
RUN yarn install --production

# 复制当前目录的所有内容到镜像的工作目录中
# COPY . .

# 生成 Prisma 模型
RUN npx prisma generate

# 暴露端口
EXPOSE 3000

# 使用 PM2 啟動應用程序
CMD ["pm2-runtime", "start", "index.js", "--name", "Azure_Api"]