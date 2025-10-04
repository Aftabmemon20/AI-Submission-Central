# AI Submission Central (A.S.C.)

**The Future of Hackathon Judging is Here.**

A.S.C. is an AI-powered, multi-tenant platform designed to automate the initial screening and evaluation of hackathon projects. It uses a sophisticated agent-based architecture, powered by Docker and Cerebras AI, to provide unbiased, data-driven insights, saving judges hundreds of hours and reducing human bias.

![A.S.C. Landing Page](docs/images/landing.png)

---

## 🎯 The Problem

Hackathon judging is broken. It's slow, tiring, inconsistent, and doesn't scale. Judges, who are often industry experts volunteering their time, are forced to spend hours on repetitive screening tasks instead of focusing on what truly matters: a project's innovation and impact.

---

## 💡 Our Solution: An Autonomous Judging Agent

A.S.C. solves this by providing a complete platform for judges and submitters, featuring an AI-powered evaluation system that analyzes projects in real-time.

---

## 🎬 How It Works (The User Journey)

### Step 1: Judge Login & Portal Access

Judges sign in through our secure authentication system to access the **Judges Portal**.

<img width="1843" height="989" alt="Screenshot 2025-10-04 230045" src="https://github.com/user-attachments/assets/cbdd6c37-bc25-4a92-b8f3-5bbbd87e9a81" />

### Step 2: Create a Hackathon Session

Once logged in, judges can:
- **Create a new hackathon** by providing a name and judging criteria
- View their existing hackathons with unique IDs
- Access private dashboards for each hackathon

The system generates a unique **Hack ID** for each session, which judges share with participants.

<img width="1850" height="986" alt="Screenshot 2025-10-04 230134" src="https://github.com/user-attachments/assets/33eabdf0-484e-459e-a002-1c0a3fbe0a63" />

### Step 3: View Submissions Dashboard

Judges can monitor all submissions for their hackathon in real-time. The dashboard automatically categorizes projects into:
- **AI Accepted**: Projects that meet the criteria
- **AI Rejected**: Projects that don't meet requirements

Each submission includes:
- Innovation and Impact scores
- Detailed AI-generated evaluation
- GitHub repository link
- Video demo access

<img width="1824" height="976" alt="Screenshot 2025-10-04 230209" src="https://github.com/user-attachments/assets/0092912f-b632-4201-af37-6ef4def6995a" />


### Step 4: Participant Submission

Students/participants:
1. Navigate to the platform
2. Enter the **Hack ID** provided by their judge
3. Fill out the submission form with:
   - Team name
   - Project title
   - GitHub repository URL
   - Video demo URL
<img width="1809" height="942" alt="Screenshot 2025-10-04 230244" src="https://github.com/user-attachments/assets/8ede4691-b1ad-40f8-b4b0-e9f0ed58e9d9" />




<img width="1788" height="980" alt="Screenshot 2025-10-04 230307" src="https://github.com/user-attachments/assets/f47b10d1-bbeb-40d5-bb7c-5115ea07ef2d" />

### Step 5: AI Evaluation

In the background, our autonomous agent:
1. Clones and analyzes the GitHub repository
2. Extracts and processes the video demo
3. Evaluates against the judge's criteria using Cerebras AI
4. Generates innovation and impact scores
5. Provides detailed justification for the decision

The evaluated project instantly appears on the judge's dashboard!

---

## 🏗️ Tech Stack & Architecture

### Frontend
- **Next.js** - React framework for production
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful UI components
- **Aceternity UI** - Modern design elements
- **Clerk** - Secure authentication

### Backend
- **Python** - Core logic
- **Flask** - Web framework
- **Docker** - Containerization
- **Gunicorn** - WSGI HTTP Server
- **SQLAlchemy** - Database ORM
- **SQLite** - Database

### AI & Services
- **Cerebras Cloud API** - Ultra-fast AI inference
- **GitHub API** - Repository analysis
- **YouTube API** - Video processing

---

## 🏆 Creative Implementation of Docker MCP Gateway

Our architecture is a creative, real-world implementation of the **Docker MCP Gateway** philosophy:

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                  │
│                   Port: 3000                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Agent Service (Controller)                 │
│              Port: 5001                                 │
│  • Orchestrates workflow                               │
│  • Manages hackathon sessions                          │
│  • Routes requests to tools                            │
└───────┬──────────────────────────┬──────────────────────┘
        │                          │
        ▼                          ▼
┌──────────────────┐      ┌──────────────────┐
│  GitHub Reader   │      │  Video Parser    │
│  Port: 5002      │      │  Port: 5003      │
│  • Clone repos   │      │  • Parse videos  │
│  • Analyze code  │      │  • Extract info  │
└──────────────────┘      └──────────────────┘
        │                          │
        └──────────┬───────────────┘
                   ▼
         ┌──────────────────┐
         │   Cerebras AI    │
         │   Inference      │
         │   • Evaluates    │
         │   • Scores       │
         │   • Justifies    │
         └──────────────────┘
```

The central `agent` service acts as the **Controller**, orchestrating containerized **Tools** (`github-reader`, `video-parser`) and making an **Inference** call to the Cerebras AI, all based on the judge's initial **Instruction**.

---

## 🚀 Local Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- Docker & Docker Compose
- Node.js (v18+) & npm
- A [Cerebras Cloud API Key](https://cloud.cerebras.ai/)
- A [Clerk.dev](https://clerk.dev/) account with API keys

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### 2. Configure Backend Environment

Create a `.env` file in the project root:

```bash
# Create the .env file
echo "CEREBRAS_API_KEY=your_cerebras_api_key_here" > .env
```

### 3. Configure Frontend Environment

Navigate to the frontend folder and create a `.env.local` file:

```bash
# Navigate into the frontend directory
cd frontend

# Create the .env.local file
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...your_publishable_key..." > .env.local
echo "CLERK_SECRET_KEY=sk_test_...your_secret_key..." >> .env.local
```

**⚠️ CRITICAL:** You also need to configure the Judge's email in `frontend/src/app/page.tsx` to gain access to the Judge's Portal.

```bash
# Navigate back to the root directory
cd ..
```

### 4. Build and Run the Backend

With Docker running, execute the following from the project root:

```bash
docker-compose up --build
```

This will build and start all three backend services:
- Agent Service (Port 5001)
- GitHub Reader (Port 5002)
- Video Parser (Port 5003)

### 5. Run the Frontend

Open a **new terminal window**, navigate to the `frontend` folder, and run:

```bash
# Navigate into the frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Your application is now running at **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
.
├── agent/                  # Main orchestration service
│   ├── app.py             # Flask application
│   ├── Dockerfile
│   └── requirements.txt
├── github-reader/         # GitHub analysis tool
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── video-parser/          # Video processing tool
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # Next.js frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.local
├── docker-compose.yml     # Docker orchestration
├── .env                   # Backend environment variables
└── README.md
```

---

## 🎯 Key Features

✅ **Multi-tenant Architecture** - Multiple judges can run concurrent hackathons  
✅ **Real-time Evaluation** - Instant AI-powered project analysis  
✅ **GitHub Integration** - Automatic repository cloning and analysis  
✅ **Video Demo Processing** - Extract insights from demonstration videos  
✅ **Customizable Criteria** - Judges define their own evaluation parameters  
✅ **Detailed Scoring** - Innovation and Impact metrics with justifications  
✅ **Secure Authentication** - Clerk-powered auth for judges and participants  
✅ **Containerized Services** - Scalable Docker-based microservices  

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---



---

## 🙏 Acknowledgments

- Built with [Cerebras Cloud](https://cloud.cerebras.ai/) for ultra-fast AI inference
- UI components from [shadcn/ui](https://ui.shadcn.com/) and [Aceternity UI](https://ui.aceternity.com/)
- Authentication powered by [Clerk](https://clerk.dev/)

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for the hackathon community**
