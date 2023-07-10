# SS-Theme
This is a full-stack web application that allows users to view forms, and submit responses to these forms. The application uses Flask and MongoDB for the backend and React for the frontend.

## Technologies used

- Frontend: React.js
- Backend: Flask, MongoDB
- Infrastructure: Docker

## Application Architecture
The frontend allows users to register and log in. Registered users can view and submit responses to various forms.

The backend uses Flask and MongoDB to manage user information and form data.

User authentication is implemented with JSON Web Tokens (JWT).

## How to Run

### Prerequisites

- Docker
- Docker Compose

### Steps

1. Clone the repository:

git clone https://github.com/Koray497/SS-Theme

2. Go to the project directory:

cd SS-Theme

3. Build and run the Docker containers:

docker compose up

The application can then be accessed at http://localhost:3000 for the frontend and http://localhost:5000 for the backend API.

## Contributing

We welcome contributions to this project. Please feel free to open an issue or submit a pull request.

## License

This project is open source under the MIT license.
