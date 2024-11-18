### **README.md**

# Wake-On-LAN App

This project is a full-stack application with a **frontend** and a **backend**. It supports both **development** and **production** environments using Docker and Docker Compose. 

The application is designed for flexibility, with clear scripts and configurations for managing the lifecycle of the app in different environments.

---

## **Features**
- **Frontend**:
  - Built with Node.js.
  - Runs a development server or builds production assets.
- **Backend**:
  - Also built with Node.js.
  - Supports hot-reloading in development mode.
- **Dockerized Environment**:
  - Development and production workflows managed with Docker Compose.
  - Environment-specific behavior controlled by `NODE_ENV`.

---

## **Requirements**
- Docker (version 20.10+ recommended)
- Docker Compose (version 1.29+ recommended)

---

## **Setup Instructions**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/wake-on-lan.git
   cd wake-on-lan
   ```

2. Ensure Docker is installed and running:
   - [Install Docker](https://docs.docker.com/get-docker/)

3. Make the `start.sh` script executable:
   ```bash
   chmod +x start.sh
   ```

---

## **Usage**

### Start the Application

#### Development Mode
To start the application in **development** mode:
```bash
./start.sh
```

- Default environment is `dev`.
- Services run in **attached mode** (logs will be displayed in the terminal).
- Frontend is available at: [http://localhost:3000](http://localhost:3000).
- Backend uses `host` networking and can be accessed at the appropriate endpoint.

#### Optional: Detached Development
To run in **detached mode** (background):
```bash
./start.sh dev true
```

#### Production Mode
To start the application in **production** mode:
```bash
./start.sh prod
```

- Default behavior is **detached mode** (services run in the background).
- To run in attached mode for production:
  ```bash
  ./start.sh prod false
  ```

---

### Stop the Application
Stop all running containers and clean up:
```bash
docker-compose down --remove-orphans
```

---

## **Directory Structure**
```
.
├── docker-compose.yml      # Unified Compose file for dev and prod
├── start.sh                # Script to manage dev and prod environments
├── frontend/               # Frontend source code
│   ├── Dockerfile          # Dockerfile for the frontend
│   ├── package.json        # Node.js dependencies for frontend
│   └── ...                 # Additional frontend files
├── backend/                # Backend source code
│   ├── Dockerfile          # Dockerfile for the backend
│   ├── package.json        # Node.js dependencies for backend
│   └── ...                 # Additional backend files
```

---

## **Key Commands**

### View Logs
To view logs for all services:
```bash
docker-compose logs -f
```

To view logs for a specific service (e.g., `frontend`):
```bash
docker-compose logs -f frontend
```

---

## **Customizing the Environment**
The environment is controlled via the `NODE_ENV` variable:
- **Development**: Default behavior. Includes hot-reloading and mapped volumes for code changes.
- **Production**: Optimized for performance, with frontend assets served by the backend.

---

## **Troubleshooting**

1. **Permission Denied for Docker Socket**:
   - Ensure your user is in the `docker` group:
     ```bash
     sudo usermod -aG docker $USER
     ```
   - Log out and back in for the changes to take effect.

2. **Containers Fail to Start**:
   - Check logs for errors:
     ```bash
     docker-compose logs -f
     ```

3. **Rebuild Images**:
   - If changes to dependencies or Dockerfiles are not picked up:
     ```bash
     docker-compose build --no-cache
     ```

4. **Clean Up Orphaned Containers**:
   - If containers persist after stopping:
     ```bash
     docker-compose down --remove-orphans
     ```

---

## **Contributing**
Feel free to open issues or submit pull requests for improvements.

---

## **License**
This project is licensed under the MIT License.
