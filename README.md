# Pomodoro Timer Web App

A simple Pomodoro timer with Jenkins CI/CD pipeline for DevOps learning.

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:8080

## Docker

```bash
docker build -t pomodoro-webapp .
docker run -d -p 8080:80 pomodoro-webapp
```

## Commands

- `npm start` - Start dev server (port 8080)
- `npm run build` - Build to dist/
- `npm test` - Run tests
- `npm run clean` - Clean build artifacts

## Features

- 25-min work sessions, 5-min short breaks, 15-min long breaks
- Customizable durations and session counter
- Browser notifications and responsive UI

## Jenkins CI/CD

Automated deployment with stages: checkout → install → build → deploy → start. Push to main branch triggers deployment.
