# PreHire - Resume Upload & Profile Creation System

A comprehensive platform connecting candidates and recruiters through AI-powered resume matching.

## Features

### 🎯 Candidate Features
- **Resume Upload**: Drag & drop or file picker for PDF/DOCX files
- **AI Resume Parsing**: Automatic extraction of skills, experience, and education
- **Resume Scoring**: Real-time quality assessment (0-100 scale)
- **Profile Management**: Complete profile with photo, LinkedIn, contact info
- **Secure Authentication**: JWT-based login/registration

### 🏢 Recruiter Features
- **Company Profile Setup**: Logo, company info, contact details
- **Candidate Dashboard**: View and filter candidates
- **Advanced Filtering**: By skills, resume score, experience
- **Real-time Search**: Find perfect matches instantly

### 🤖 AI/NLP Features
- **Smart Parsing**: Extract structured data from resumes
- **Skill Detection**: Identify technical and soft skills
- **Experience Analysis**: Parse work history and education
- **Quality Scoring**: Comprehensive resume evaluation

## Tech Stack

- **Frontend**: React 18, React Router, Axios, React Dropzone
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI Service**: PDF parsing, DOCX processing, NLP analysis
- **Authentication**: JWT tokens, bcrypt password hashing
- **File Storage**: Local storage + AWS S3 support
- **Database**: MongoDB with user profiles and resume data

## Project Structure

```
prehire-app/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   └── utils/      # Auth context, helpers
├── backend/            # Express API server
│   ├── src/
│   │   ├── models/     # MongoDB schemas
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Auth middleware
│   │   └── config/     # Database config
├── ai-service/         # Resume parsing service
└── uploads/           # Local file storage
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone and setup**:
   ```bash
   cd prehire-app
   ```

2. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd ../frontend && npm install
   
   # AI Service
   cd ../ai-service && npm install
   ```

3. **Start MongoDB**:
   - Local: `mongod`
   - Or use MongoDB Atlas cloud

4. **Start all services**:
   ```bash
   # Windows
   start-dev.bat
   
   # Or manually:
   # Terminal 1: cd backend && npm run dev
   # Terminal 2: cd ai-service && npm run dev  
   # Terminal 3: cd frontend && npm start
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Candidates
- `GET /api/candidate/profile` - Get candidate profile
- `PUT /api/candidate/profile` - Update candidate profile
- `PUT /api/candidate/resume-data` - Update parsed resume data

### Recruiters
- `GET /api/recruiter/profile` - Get recruiter profile
- `PUT /api/recruiter/profile` - Update recruiter profile
- `GET /api/recruiter/candidates` - Get filtered candidates

### File Upload
- `POST /api/upload/resume` - Upload resume file

### AI Service
- `POST /api/parse-resume` - Parse uploaded resume

## Environment Variables

Create `.env` file in backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prehire
JWT_SECRET=your_jwt_secret_key

# Optional AWS S3
USE_S3=false
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=prehire-resumes
```

## Usage Guide

### For Candidates:
1. Register with role "candidate"
2. Upload resume (PDF/DOCX, max 5MB)
3. AI automatically parses and scores resume
4. Complete profile with additional info
5. View resume score and extracted data

### For Recruiters:
1. Register with role "recruiter"  
2. Setup company profile
3. Browse candidate database
4. Filter by skills, score, experience
5. Contact qualified candidates

## File Upload & Storage

- **Local Storage**: Files saved to `backend/uploads/`
- **AWS S3**: Set `USE_S3=true` in environment
- **Validation**: PDF/DOCX only, 5MB max size
- **Security**: Files linked to user accounts

## Resume Parsing Algorithm

The AI service extracts:
- **Contact Info**: Email, phone number
- **Skills**: Technical keywords matching
- **Experience**: Work history parsing
- **Education**: Academic background
- **Scoring**: Weighted algorithm (0-100)

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- File type validation
- Size limits on uploads
- Protected API routes
- Input sanitization

## Development

### Adding New Features:
1. Backend: Add routes in `backend/src/routes/`
2. Frontend: Add components in `frontend/src/`
3. Database: Update models in `backend/src/models/`

### Testing:
- Use Postman for API testing
- MongoDB Compass for database inspection
- Browser dev tools for frontend debugging

## Deployment

### Production Setup:
1. Set production environment variables
2. Build frontend: `npm run build`
3. Use PM2 for process management
4. Setup reverse proxy (nginx)
5. Configure SSL certificates

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review API endpoints
- Test with provided examples

---

**PreHire** - Connecting talent with opportunity through intelligent matching.