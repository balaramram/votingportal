# PRID2026001 - Voting Portal

A secure and efficient voting portal built with Node.js, Express.js, and MongoDB for college elections. Supports admin poll creation, user authentication with fingerprint verification, and department-based voting.

## Features

- **Admin Management**: Admins can create and manage voting polls for specific departments
- **User Authentication**: Secure login with email, password, and fingerprint verification
- **Department-Based Voting**: Polls are restricted to specific departments
- **Real-Time Results**: Admins can view poll results
- **Error Handling & Logging**: Comprehensive logging and error management
- **Security**: JWT-based authentication, password hashing, and input validation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Logging**: Winston for logging
- **Email**: Nodemailer for notifications
- **Validation**: Custom middleware

## Project Structure

```
PRID2026001-Voting-Portal/
├── config/
│   ├── bd.js              # Database connection
│   ├── corsOrgine.js      # CORS configuration
│   └── env.js             # Environment variables setup
├── controller/
│   ├── authController.js  # Admin authentication
│   ├── userController.js  # User management
│   └── pollController.js  # Poll operations
├── middleware/
│   ├── authMiddleware.js          # Admin authentication middleware
│   ├── userAuthMiddleware.js      # User authentication middleware
│   └── log-error-handler/
│       ├── logemodule.js          # Error handling and logging
│       └── logger.js              # Logger configuration
├── models/
│   ├── AdminModel.js      # Admin schema
│   ├── UserModel.js       # User schema
│   ├── VotingModel.js     # Poll schema
│   └── VerificationToken.js # Email verification
├── routes/
│   ├── authRoute.js       # Admin routes
│   ├── userRoute.js       # User routes
│   └── votingRoute.js     # Voting routes
├── utils/
│   └── emailUtility.js    # Email sending utility
├── server.js              # Main application file
├── package.json
├── .env                   # Environment variables
└── README.md
```

## Architecture

### MVC Pattern

- **Models**: Define data schemas and business logic
- **Views**: Not applicable (API-only)
- **Controllers**: Handle request/response logic

### Security Layers

1. **Authentication**: JWT tokens for session management
2. **Authorization**: Role-based access (Admin/User)
3. **Validation**: Input sanitization and validation
4. **Error Handling**: Centralized error management

### Database Design

- **Admin**: Manages multiple departments
- **User**: Belongs to specific department, year, batch
- **Voting**: Poll with options, votes, and department restriction

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd PRID2026001-Voting-Portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/VotingPortal
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the server**
   ```bash
   npm run dev  # For development with nodemon
   # or
   node server.js  # For production
   ```

## API Endpoints

### Admin Routes (`/api/auth`)

#### Admin Registration

- **POST** `/api/user/admin/register`
- **Description**: Register a new admin
- **Payload**:
  ```json
  {
    "email": "admin@college.edu",
    "password": "adminpassword",
    "department": ["Computer Science", "Electronics"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin registered successfully"
  }
  ```

#### Admin Login

- **POST** `/api/auth/admin/login`
- **Description**: Authenticate admin
- **Payload**:
  ```json
  {
    "email": "admin@college.edu",
    "password": "adminpassword"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_here"
  }
  ```
- **Note**: Store the JWT token in an HTTP-only cookie for subsequent authenticated requests.

### User Routes (`/api/user`)

#### User Registration

- **POST** `/api/user/register`
- **Description**: Register a new user
- **Payload**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@college.edu",
    "password": "userpassword",
    "dob": "2000-01-01",
    "fingerprintData": "fingerprint_hash",
    "department": "Computer Science",
    "year": 3,
    "batch": "2020-2024"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully"
  }
  ```

#### User Login

- **POST** `/api/auth/user/login`
- **Description**: Authenticate user with fingerprint
- **Payload**:
  ```json
  {
    "email": "john.doe@college.edu",
    "password": "userpassword",
    "fingerprintData": "fingerprint_hash"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "userId": "user_id"
  }
  ```
- **Note**: Store the JWT token in an HTTP-only cookie for subsequent authenticated requests.

#### Get User Profile

- **GET** `/api/user/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieve the authenticated user's profile information
- **Note**: Store the JWT token received from login in an HTTP-only cookie on the frontend. If your frontend is on a different origin, ensure you:
  - enable credentials in requests (e.g., `fetch(..., { credentials: 'include' })` or `axios.defaults.withCredentials = true`)
  - the server CORS `credentials` is enabled (already set in this project)
  - in development the cookie is set with `SameSite=Lax`; in production `SameSite=None; Secure` is used so cross-site cookies will work over HTTPS.
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "name": "John Doe",
      "email": "john.doe@college.edu",
      "department": "Computer Science",
      "year": 3,
      "batch": "2020-2024"
    }
  }
  ```

### Voting Routes (`/api/voting`)

#### Create Poll (Admin Only)

- **POST** `/api/voting/create`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Create a new voting poll
- **Note**: Store the admin JWT token in an HTTP-only cookie after login. Retrieve it from the cookie and include in the Authorization header for admin requests.
- **Payload**:
  ```json
  {
    "title": "Class Representative Election",
    "options": ["Candidate A", "Candidate B", "Candidate C"],
    "department": "Computer Science", // or "all" to make it available to all departments
    "endDate": "2026-01-20T23:59:59Z"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Poll created successfully",
    "poll": {
      "title": "Class Representative Election",
      "options": ["Candidate A", "Candidate B", "Candidate C"],
      "department": "Computer Science",
      "createdBy": "admin_id",
      "endDate": "2026-01-20T23:59:59.000Z",
      "isActive": true
    }
  }
  ```

#### Get Polls

- **GET** `/api/voting/?department=Computer Science`
- **Description**: Get active polls for a department (includes polls specific to the department and polls available to all departments)
- **Response**:
  ```json
  {
    "success": true,
    "polls": [
      {
        "title": "Class Representative Election",
        "options": ["Candidate A", "Candidate B", "Candidate C"],
        "department": "Computer Science",
        "endDate": "2026-01-20T23:59:59.000Z"
      },
      {
        "title": "College President Election",
        "options": ["Candidate X", "Candidate Y"],
        "department": "all",
        "endDate": "2026-01-25T23:59:59.000Z"
      }
    ]
  }
  ```

#### Vote on Poll

- **POST** `/api/voting/vote`
- **Headers**: `Authorization: Bearer <user_token>`
- **Description**: Cast a vote on a poll
- **Note**: Store the user JWT token in an HTTP-only cookie after login. Retrieve it from the cookie and include in the Authorization header for voting requests.
- **Payload**:
  ```json
  {
    "pollId": "poll_id_here",
    "option": "Candidate A"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Vote cast successfully"
  }
  ```

#### Get Poll Results (Admin Only)

- **GET** `/api/voting/results/:pollId`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Get detailed results for a poll
- **Note**: Retrieve the admin JWT token from the HTTP-only cookie and include in the Authorization header.
- **Response**:
  ```json
  {
    "success": true,
    "poll": {
      "title": "Class Representative Election",
      "options": ["Candidate A", "Candidate B", "Candidate C"],
      "department": "Computer Science"
    },
    "results": [
      {
        "option": "Candidate A",
        "votes": 45
      },
      {
        "option": "Candidate B",
        "votes": 32
      },
      {
        "option": "Candidate C",
        "votes": 28
      }
    ]
  }
  ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with HTTP-only cookies for storage
- **Fingerprint Verification**: Additional security layer
- **Department Authorization**: Admins restricted to their departments
- **Input Validation**: Prevents malicious inputs
- **CORS**: Configured for allowed origins
- **Rate Limiting**: Can be added via middleware

### Token Management

- JWT tokens are issued upon successful login (admin/user)
- Store tokens in HTTP-only cookies on the frontend to prevent XSS attacks
- Include tokens in Authorization header (`Bearer <token>`) for authenticated requests
- Tokens are retrieved from cookies and automatically included in request headers

## Logging

The application uses Winston for comprehensive logging:

- **Error Logs**: Controller errors and exceptions
- **Request Logs**: All API requests with user info
- **Activity Logs**: Successful operations

Logs are stored in the `logs/` directory with daily rotation.

## Development

### Available Scripts

- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (placeholder)

### Testing the API

Use tools like Postman or curl to test endpoints. Ensure to include appropriate headers and payloads as described above.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

ISC

## Author

A. Luvin-Max
