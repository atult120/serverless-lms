
# 📚 LMS How-To Videos Service

A Serverless-based microservice for managing **How-To Videos** in an LMS platform, built with AWS Lambda, API Gateway, Cognito Authentication, RDS (MySQL), and TypeORM.

---

## 🚀 Features
- Create, Read, Update How-To videos
- Secure APIs with AWS Cognito
- Connect to RDS MySQL without VPC for public endpoints
- DTO validation with `class-validator`
- Video creation with metadata
- Configurable for both local and AWS deployment
- Embedded Postman collection in this README

---

## 🛠️ Tech Stack
- **Backend:** Node.js 18, TypeScript
- **Framework:** Serverless Framework
- **Auth:** AWS Cognito (JWT)
- **Database:** AWS RDS MySQL + TypeORM
- **Cloud Services:** API Gateway, Lambda, SSM Parameter Store
- **Build:** esbuild
- **Validation:** class-validator, class-transformer

---

## ⚙️ Environment Variables
Create a `.env` file from `.env.example`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=lms
COGNITO_USER_POOL_ID=ap-south-1_<<<your_pool_id>>>
COGNITO_CLIENT_ID=<<<your_client_id>>>
AUTH_MODE=local
```

---

## 💻  Local Development

#Clone the project
```bash
git clone https://github.com/atult120/serverless-lms.git
```

```bash
  cd serverless-lm
```
# Install dependencies
```bash
npm install --legacy-peer-dep
```

# Create .env file
```bash
cp .env.example .env
```
# Run migration
```bash
npm run migration:run
```

# Build code
```bash
npm run build
```

# Start local serverless
```bash
npx serverless offline --stage local
```

## 📋 Prerequisites Before Deployment

Before you deploy to AWS, make sure you have the following:

### 1️⃣ AWS Account Setup
- An **AWS account** with permissions to create:
  - Lambda Functions
  - API Gateway
  - Cognito User Pools & Clients
  - RDS MySQL Database
  - SSM Parameter Store entries
  - IAM Roles & Policies
- Installed **AWS CLI v2** and configured credentials:
```bash
aws configure
```

## Store Config in SSM Parameter Store

```bash
aws ssm put-parameter --name "/lms/dev/db_host" --value "<RDS_ENDPOINT>" --type "String"

aws ssm put-parameter --name "/lms/dev/db_user" --value "admin" --type "String"

aws ssm put-parameter --name "/lms/dev/db_pass" --value "YourSecurePassword123" --type "SecureString"

aws ssm put-parameter --name "/lms/dev/db_name" --value "lms" --type "String"

aws ssm put-parameter --name "/lms/dev/cognito_user_pool_id" --value "<USER_POOL_ID>" --type "String"

aws ssm put-parameter --name "/lms/dev/cognito_client_id" --value "<CLIENT_ID>" --type "String"

aws ssm put-parameter --name "/lms/dev/auth_mode" --value "cognito" --type "String"
```

## ☁️ Deploy to AWS
```bash
npx serverless deploy --stage dev
```

## 🔑 Authentication Flow

### **Local Development**
- If running locally (`serverless offline`), **authentication is bypassed** for simplicity.  
- The backend automatically assigns a **mock admin user** so you can hit APIs without logging in.  

---

### **Deployed on AWS**
When deployed to AWS with Cognito enabled (`AUTH_MODE=cognito`):

#### 1️⃣ Get Cognito Token (Login API)
Call the **Login API** first to get your Cognito **ID Token**:

```bash
POST https://<your-api-gateway-url>/lms/login
Content-Type: application/json

{
  "username": "<your_cognito_username>",
  "password": "<your_password>"
}
	1.	Call /lms/login with username + password
	2.	Receive ID Token from Cognito
	3.	Pass token in header:

Authorization: Bearer <ID_TOKEN>
```

## 📮 Postman Collection
You can import the Postman collection to test all API endpoints.

**Download:** [LMS HowTo API Postman Collection](./docs/LMS-HowTo-API.postman_collection.json)

**Steps to Import in Postman:**
1. Open Postman
2. Click **Import**
3. Select the file `LMS-HowTo-API.postman_collection.json`
4. Set `baseUrl` to your API Gateway URL or `localBaseUrl` for local testing
5. If using deployed AWS Lambda, first call the `Login API` to get an `accessToken` and set it in Postman variables.

