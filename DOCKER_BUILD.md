# Frontend Docker Build Guide

This guide explains how to build and run the frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier deployment)

## Building the Docker Image

### Basic Build

```bash
docker build -t binhphu-frontend:latest .
```

### Build with Custom Tag

```bash
docker build -t binhphu-frontend:v1.0.0 .
```

## Running the Container

### Run with Default Backend URL

```bash
docker run -p 3000:3000 binhphu-frontend:latest
```

### Run with Custom Backend URL

```bash
docker run -p 3000:3000 \
  -e BACKEND_URL=https://cms-binhphu.vkhealth.vn \
  binhphu-frontend:latest
```

### Run with Environment File

```bash
docker run -p 3000:3000 --env-file .env.production binhphu-frontend:latest
```

## Docker Compose Deployment

Create a `docker-compose.yml` file (see example in this directory) and run:

```bash
docker-compose up -d
```

To stop:

```bash
docker-compose down
```

## Environment Variables

The following environment variables can be configured:

- `BACKEND_URL`: Backend API URL (default: `https://cms-binhphu.vkhealth.vn`)
- `NODE_ENV`: Node environment (set to `production` in Docker)
- `PORT`: Port to run the application (default: `3000`)

## Image Optimization

This Dockerfile uses a multi-stage build process:

1. **deps**: Installs dependencies using pnpm
2. **builder**: Builds the Next.js application in standalone mode
3. **runner**: Creates a minimal production image with only necessary files

### Image Size Benefits

- Standalone output reduces image size significantly
- Multi-stage build excludes dev dependencies
- Alpine Linux base image for minimal footprint

## Production Deployment

### Building for Production

```bash
# Build the image
docker build -t binhphu-frontend:production .

# Tag for registry
docker tag binhphu-frontend:production your-registry.com/binhphu-frontend:latest

# Push to registry
docker push your-registry.com/binhphu-frontend:latest
```

### Health Checks

The application runs on port 3000. You can add health checks in your orchestration tool:

```bash
curl http://localhost:3000/
```

## Troubleshooting

### Build Fails

1. Ensure you have a stable internet connection for dependency installation
2. Check that `pnpm-lock.yaml` is up to date
3. Verify Node.js version compatibility (uses Node 20)

### Container Doesn't Start

1. Check logs: `docker logs <container-id>`
2. Verify environment variables are set correctly
3. Ensure port 3000 is not already in use

### Backend Connection Issues

1. Verify `BACKEND_URL` is set correctly
2. Check network connectivity between containers (if using Docker Compose)
3. Ensure backend service is running and accessible

## Development vs Production

- **Development**: Use `pnpm dev` for hot-reload and faster iteration
- **Production**: Use Docker for consistent, optimized deployment

## Next Steps

1. Set up CI/CD pipeline to automate builds
2. Configure container orchestration (Kubernetes, Docker Swarm)
3. Set up monitoring and logging
4. Configure reverse proxy (Nginx, Traefik) for SSL termination
