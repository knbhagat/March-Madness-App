# March Madness Betting Platform

A full-stack web application that simulates sports betting for the NCAA March Madness tournament. Users can create brackets, track live scores, and compete with others in a simulated betting environment.

## Features

- **User Authentication**: Secure login and registration system
- **Live Bracket Creation**: Interactive bracket interface for March Madness predictions
- **Real-time Updates**: Live scores and game updates
- **Bracket Scoring**: Automated scoring system based on game outcomes
- **User Profiles**: Save and manage multiple brackets
- **Live Scores Page**: Real-time game statistics and results
- **AI Chatbot**: Interactive assistant for tournament information
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios for API calls
- WebSocket for real-time updates
- ShadCN library
- Typescript deployed with Vite

### Backend
- Python/Flask
- RESTful API architecture
- SQL Database
- JWT Authentication

### DevOps
- Docker containerization
- CI/CD Pipeline
- Development and Production environments

## Getting Started

### Prerequisites
- Docker
- Node.js
- Python 3.x

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Start the development environment:
```bash
docker-compose -f docker-compose-dev.yml up --build
```

3. Start the production environment:
```bash
docker-compose -f docker-compose-prod.yml up --build
```

4. Start the React development server:
```bash
npm run dev
```

## Architecture

The application follows a microservices architecture with three main components:
1. Frontend React application
2. Backend Flask API
3. SQL Database

Each component is containerized using Docker for consistent development and deployment environments.

## API Integration

The platform integrates with external APIs to provide:
- Live game scores
- Team statistics
- Tournament brackets
- Real-time updates

## Security Features

- JWT-based authentication
- Password hashing
- Environment variable management
- Secure API endpoints