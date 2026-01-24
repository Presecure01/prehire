import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/upload/resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setUploadStatus('Upload successful! Processing resume...');
      
      // Parse the resume using AI service
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const parseResponse = await axios.post('http://localhost:3001/api/parse-resume', {
          fileUrl: response.data.fileUrl,
          userId: user?.id
        }, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Update profile with parsed data
        const parsedData = parseResponse.data.data || parseResponse.data;
        if (parsedData) {
          try {
            await axios.put('http://localhost:5001/api/candidate/resume-data', {
              name: parsedData.name,
              email: parsedData.email,
              phone: parsedData.phone,
              skills: parsedData.skills,
              education: parsedData.education,
              experienceYears: parsedData.experienceYears,
              linkedin: parsedData.linkedin,
              github: parsedData.github,
              languages: parsedData.languages,
              summary: parsedData.summary
            }, {
              headers: { 
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (updateError) {
            console.error('Failed to update profile with parsed data:', updateError);
          }
        }
        
        setUploadStatus('Resume processed successfully!');
        if (onUploadSuccess) {
          onUploadSuccess({
            ...response.data,
            parsedData: parsedData
          });
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setUploadStatus('Resume uploaded but parsing failed: ' + parseError.message);
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }
    } catch (error) {
      setUploadStatus('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div style={styles.container}>
      <h3>Upload Resume</h3>
      
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
          ...(uploading ? styles.dropzoneDisabled : {})
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop the resume here...</p>
        ) : (
          <div style={styles.dropzoneContent}>
            <p>Drag & drop your resume here, or click to select</p>
            <p style={styles.fileTypes}>Supported: PDF, DOC, DOCX (max 5MB)</p>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div style={styles.status}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '2rem'
  },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    backgroundColor: '#fafafa'
  },
  dropzoneActive: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd'
  },
  dropzoneDisabled: {
    cursor: 'not-allowed',
    opacity: 0.6
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem'
  },
  fileTypes: {
    fontSize: '0.875rem',
    color: '#666'
  },
  status: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '4px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2'
  }
};

export default ResumeUpload;