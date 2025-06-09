# Fundusnap API

Fundusnap API is a backend service for the Fundusnap mobile app that helps identify signs of diabetic retinopathy. This service provides endpoints for user authentication, image analysis, and AI-powered chat interactions about retinal health.

## 🚀 Tech Stack

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: Azure Blob Storage
- **AI Services**: 
  - Microsoft Azure Custom Vision API (for image classification)
  - OpenRouter API with Microsoft MAI-DS-R1 model (for medical chat interactions)
- **Email Service**: Nodemailer
- **Other Dependencies**:
  - bcrypt (password hashing)
  - cors (Cross-Origin Resource Sharing)
  - dotenv (environment variables)
  - ejs (templating engine)
  - file-type (file type detection)

## 🏥 Medical AI Model

The application uses Microsoft's MAI-DS-R1 model through OpenRouter API for medical chat interactions. This model is specifically trained for medical domain conversations and is optimized for discussing medical conditions, test results, and providing healthcare-related information. The model is used to help explain diabetic retinopathy predictions and answer user questions about their retinal health in a medically accurate and helpful manner.

## ☁️ Infrastructure & Security

### Hosting
The application is hosted on Azure Virtual Machines, providing:
- High availability and scalability
- Regular security updates
- Managed infrastructure
- Geographic redundancy

### Storage & HIPAA Compliance
Medical images and data are stored in Azure Blob Storage with the following security measures:
- Server-side encryption for data at rest
- Private container access
- HIPAA compliance for medical data storage
- Secure data transfer using HTTPS
- Access control through Azure Active Directory
- Audit logging for all data access

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/fundusnap/fundusnap-api.git
cd fundusnap-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
# Server Configuration
DEBUG=true
PORT=8080

# Database Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/fundusnap?authSource=admin

# JWT Configuration
JWT_ACCESS_SECRET=your_access_token_secret
JWT_ACCESS_SECRET_DEFAULT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_SECRET_DEFAULT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=your_smtp_host
EMAIL_PORT=465
EMAIL_SSL=true
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

# Azure Vision API Configuration
AZURE_VISION_ENDPOINT=your_azure_vision_endpoint
AZURE_PREDICTION_KEY=your_azure_prediction_key

# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_CONTAINER_NAME=your_container_name

# OpenRouter Configuration
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_API_MODEL=microsoft/mai-ds-r1:free
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Email Authentication
- **POST /user/auth/email/register**
  - Register a new user
  - Body: `{ email, password }`

- **POST /user/auth/email/login**
  - Login with email and password
  - Body: `{ email, password }`

- **POST /user/auth/email/forgot-password**
  - Request password reset
  - Body: `{ email }`

- **PUT /user/auth/email/change-password**
  - Change password
  - Body: `{ token, newPassword }`

#### Token Management
- **GET /user/auth/refresh-token**
  - Refresh access token
  - Headers: `Authorization: Bearer <refresh_token>`

### Prediction Endpoints

- **POST /service/predict/create**
  - Create a new prediction from an image
  - Headers: 
    - `Authorization: Bearer <access_token>`
    - `Content-Type: application/octet-stream`
  - Body: Image buffer (max 50MB)

- **GET /service/predict/list**
  - List all predictions for the user
  - Headers: `Authorization: Bearer <access_token>`

- **GET /service/predict/read/:id**
  - Get details of a specific prediction
  - Headers: `Authorization: Bearer <access_token>`
  - Params: `id` (prediction ID)

- **PUT /service/predict/update**
  - Update prediction details
  - Headers: `Authorization: Bearer <access_token>`
  - Body: `{ id, name?, description? }`

### Chat Endpoints

- **POST /service/chat/create**
  - Create a new chat session for a prediction
  - Headers: `Authorization: Bearer <access_token>`
  - Body: `{ predictionID, query }`

- **GET /service/chat/list**
  - List all chat sessions
  - Headers: `Authorization: Bearer <access_token>`

- **GET /service/chat/read/:id**
  - Get details of a specific chat session
  - Headers: `Authorization: Bearer <access_token>`
  - Params: `id` (chat session ID)

- **PUT /service/chat/reply**
  - Send a reply in a chat session
  - Headers: `Authorization: Bearer <access_token>`
  - Body: `{ id, query }`

## 🔒 Security

- All endpoints except registration and login require JWT authentication
- Passwords are hashed using bcrypt
- CORS is enabled for specific origins
- File uploads are limited to 50MB
- Image validation is performed before processing

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Fundusnap Developers <dev@fundunsnap.com>
