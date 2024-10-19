# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install required packages for running Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg2 \
    libx11-xcb1 \
    libgtk-3-0 \
    libxdamage1 \
    libxcomposite1 \
    libasound2 \
    libxrandr2 \
    libcups2 \
    libdbus-1-3 \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    libappindicator3-1 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libxshmfence1 \
    libgobject-2.0-0 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*
    libatk1.0-0 \

# Set working directory
WORKDIR /app

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci

# Copy application code
COPY . .


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "start" ]
