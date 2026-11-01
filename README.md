# FeatureOps – Application Feature Management and Release Control System

**FeatureOps** is a web-based application feature management and release control system designed to help teams manage feature flags, control feature availability, perform gradual rollouts, and monitor application releases from a centralized dashboard.

The system provides role-based access, environment management, targeting rules, user overrides, analytics, and audit logging to support controlled and transparent feature releases.

## Project Overview

FeatureOps simplifies the process of managing application features across different environments. Instead of deploying an entire application whenever a feature needs to be enabled or disabled, administrators and developers can control feature availability through feature flags.

The platform provides a centralized interface for managing features, monitoring releases, and evaluating feature access.

## Key Features

- **Dashboard:** Overview of feature management activities and application statistics.
- **Feature Flag Management:** Create, update, enable, disable, and manage application feature flags.
- **Environment Management:** Organize features across Development, Testing, Staging, and other environments.
- **Gradual Rollouts:** Control feature availability using rollout percentages.
- **Release Management:** Manage feature release lifecycle and deployment status.
- **Targeting Rules:** Configure conditions for feature availability.
- **User Groups:** Organize users into groups for targeted feature access.
- **Overrides:** Apply environment-level and user-specific feature overrides.
- **Feature Evaluation:** Evaluate whether a feature should be enabled for a particular user or context.
- **Analytics:** View feature usage and evaluation-related information.
- **Audit Logs:** Maintain records of important management activities.
- **User Management:** Manage application users and access permissions.
- **Authentication:** Secure login and registration with token-based authentication.
- **Role-Based Access Control:** Restrict operations according to user roles.
- **SDK Integration:** Includes a Python feature flag SDK and example usage.
- **Responsive Interface:** Dashboard designed for convenient application management.
- **Multi-language Support:** Internationalization using i18next.
- **Progressive Web App:** Includes PWA installation support.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | JWT |
| Password Security | Passlib, bcrypt |
| API Communication | Axios |
| Charts and Analytics | Recharts |
| Internationalization | i18next |
| UI Components | Bootstrap, React Icons |
| SDK | Python |

## System Architecture

FeatureOps follows a frontend-backend architecture.

1. **Frontend Layer:** React provides the dashboard, authentication screens, feature management pages, and interactive user interface.
2. **API Layer:** FastAPI handles incoming HTTP requests and routes them to the appropriate application modules.
3. **Service Layer:** Business logic handles feature management, authentication, evaluation, targeting, analytics, and release operations.
4. **Database Layer:** PostgreSQL stores application users, environments, feature flags, groups, overrides, evaluation records, and audit logs.
5. **SDK Layer:** The Python SDK provides functionality for integrating feature flag evaluation into applications.

### Architecture Flow

```text
             User
               |
               v
       React Frontend
               |
               v
         FastAPI REST API
               |
               v
        Application Services
               |
               v
       SQLAlchemy ORM Layer
               |
               v
          PostgreSQL DB

       Python Feature Flag SDK
               |
               v
        Feature Evaluation API
```

## Project Structure

```text
feature-management-system/
│
├── app/
│   ├── auth/
│   ├── database/
│   ├── dependencies/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── main.py
│
├── alembic/
│   └── versions/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
│
├── feature_flag_sdk/
│
├── examples/
│
├── sdk_tests/
│
├── requirements.txt
├── alembic.ini
├── pyproject.toml
└── README.md
```

## Main Application Modules

| Module | Purpose |
|---|---|
| Authentication | Login, registration, and token-based access |
| Feature Flags | Create and manage application features |
| Environments | Manage deployment environments |
| Rollouts and Releases | Control feature rollout and release lifecycle |
| Targeting Rules | Define feature access conditions |
| Groups | Organize users for targeted access |
| Overrides | Apply custom feature availability settings |
| Evaluation | Determine feature availability |
| Analytics | Monitor feature-related information |
| Audit Logs | Track management activities |
| User Management | Manage users and their roles |

## Installation and Setup

### Prerequisites

- Python 3.11 or a compatible Python version
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Geethaa73/feature-management-system.git
cd feature-management-system
```

### 2. Create and Activate a Python Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE feature_management_db;
```

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/feature_management_db
```

Replace the username and password with your PostgreSQL credentials.

**Important:** Never commit `.env` files or database credentials to GitHub.

### 5. Run Database Migrations

From the project root:

```bash
alembic upgrade head
```

### 6. Start the Backend Server

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

### 7. Install Frontend Dependencies

Open another terminal:

```bash
cd feature-management-system/frontend
npm install
```

### 8. Start the Frontend

```bash
npm run dev
```

Open the local frontend URL displayed by Vite in your browser.

## API Overview

The backend provides REST API modules for:

| API Module | Description |
|---|---|
| Authentication | User registration and login |
| Environments | Environment management |
| Feature Flags | Feature creation and management |
| Overrides | Feature override management |
| Groups | User group management |
| User Groups | Group membership management |
| Evaluation | Feature evaluation |
| User Overrides | User-specific overrides |
| Users | User management |
| Audit Logs | Activity tracking |
| Targeting Rules | Conditional feature targeting |
| Releases | Release lifecycle management |
| Analytics | Application analytics |

All application routers are registered under the `/api` prefix.

## Security

- JWT-based authentication.
- Password hashing.
- Role-based authorization.
- Protected API endpoints.
- Environment-based database configuration.
- Git exclusion of environment and secret files.

## Future Enhancements

- Real-time feature evaluation monitoring.
- Advanced analytics and reporting.
- Automated release notifications.
- Integration with CI/CD pipelines.
- Additional SDK language support.
- Enhanced targeting and experimentation capabilities.

## Project Objective

The primary objective of FeatureOps is to simplify application feature management by providing centralized feature flags, controlled rollouts, environment-based configuration, and release monitoring.

The system aims to reduce deployment risks, improve release flexibility, and help development teams deliver application features more efficiently.

---

**Project:** FeatureOps – Application Feature Management and Release Control System

**Repository:** [GitHub – Feature Management System](https://github.com/Geethaa73/feature-management-system)

**Developed as part of:** Infosys Visual Internship
