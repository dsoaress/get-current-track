# Get current track for Apple Music

A very very very simple application that searches Apple Music on macOS for the track being played and saves it in a database.

## Run Locally

Clone the project

```bash
  git clone https://github.com/dsoaress/get-current-track.git
```

Go to the project directory

```bash
  cd get-current-track
```

Install dependencies

```bash
  yarn install
  yarn prisma generate
```

Start the server

```bash
  node index.js
```

## Installation

Install as a service

```bash
  npm install pm2 -g
  pm2 start index.js
  pm2 save
```
