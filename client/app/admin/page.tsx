"use client";

import React, { useState, useRef, ChangeEvent, MouseEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios, { AxiosProgressEvent } from 'axios';
import AdminSideBar from '@/components/admin_sidebar';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

const FASTAPI_BASE_URL = 'http://localhost:8000';
const SERVER_BASE_URL = 'http://localhost:3000';

const Impute = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useUser();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
      setUploadProgress(0);
      setJobId(null);
      setJobStatus(null);
    }
  };

  const handleUpload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${FASTAPI_BASE_URL}/api/v1/impute/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });
      
      if (response.data && response.data.job_id) {
        setJobId(response.data.job_id);
        setJobStatus(response.data.status);

        await fetch(`${SERVER_BASE_URL}/api/v1/files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id,
            bEfileId: response.data.job_id,
            status: response.data.status
          })
        });

        setUploadStatus('success');
        if (response.data.status === 'processing') {
          pollJobStatus(response.data.job_id);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const pollJobStatus = async (id: string) => {
    try {
      const response = await axios.get(`${FASTAPI_BASE_URL}/api/v1/impute/${id}/status/`, {
        withCredentials: true,
      });
      
      const newStatus = response.data.status;
      setJobStatus(newStatus);

      if (newStatus === 'processing') {
        setTimeout(() => pollJobStatus(id), 5000);
      }
    } catch (error) {
      console.error('Error checking job status:', error);
      setJobStatus('failed');
    }
  };

  const downloadResults = () => {
    if (!jobId) return;
    window.open(`${FASTAPI_BASE_URL}/api/v1/impute/${jobId}/download`, '_blank');
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (

    <div className="relative mx-auto my-10 flex max-w-4xl flex-col items-center justify-center px-4 py-10 md:py-20">

      <div className="absolute left-0 top-1/4 h-20 w-20 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute right-0 bottom-1/4 h-20 w-20 rounded-full bg-purple-600/20 blur-3xl" />
      
      {/* Page content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <h1 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Data Imputation
        </h1>
        <p className="mb-12 text-center text-lg text-white/60">
          Upload your CSV dataset and let our AI fill in missing data
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <Card className="border border-white/10 bg-white/5 backdrop-blur-lg text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-white">Upload CSV File</CardTitle>
            <CardDescription className="text-white/60">
              Upload your CSV file with missing values for imputation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div 
                onClick={triggerFileInput}
                className={`mb-6 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${file ? 'border-purple-500' : 'border-white/20'} bg-white/5 p-6 transition-all hover:bg-white/10`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="mb-2 h-10 w-10 text-purple-400" />
                    <p className="text-center text-white">{file.name}</p>
                    <p className="text-center text-sm text-white/60">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="mb-2 h-10 w-10 text-white/60" />
                    <p className="text-center text-white">Drag and drop your CSV file here</p>
                    <p className="text-center text-sm text-white/60">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="mb-4 w-full">
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm text-white/60">Uploading...</span>
                    <span className="text-sm text-white/60">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div 
                      className="h-full rounded-full bg-purple-600 transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {uploadStatus === 'success' && (
                <div className="mb-4 flex items-center rounded-lg bg-green-500/20 p-3 text-green-300">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  <span>File uploaded successfully!</span>
                </div>
              )}
              
              {uploadStatus === 'error' && (
                <div className="mb-4 flex items-center rounded-lg bg-red-500/20 p-3 text-red-300">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>Error uploading file. Please try again.</span>
                </div>
              )}

              {jobId && jobStatus && (
                <div className={`mb-4 flex items-center rounded-lg p-3 ${
                  jobStatus === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                  jobStatus === 'completed' ? 'bg-green-500/20 text-green-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {jobStatus === 'processing' ? (
                    <Clock className="mr-2 h-5 w-5" />
                  ) : jobStatus === 'completed' ? (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  ) : (
                    <AlertCircle className="mr-2 h-5 w-5" />
                  )}
                  <span>
                    {jobStatus === 'processing' ? 'Processing your data...' :
                      jobStatus === 'completed' ? 'Processing complete! Ready for download.' :
                      'Processing failed. Please try again.'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <Button 
              onClick={triggerFileInput}
              className="w-full border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              Choose File
            </Button>
            
            {jobStatus === 'completed' ? (
              <Button 
                onClick={downloadResults}
                className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
              >
                Download Results
              </Button>
            ) : (
              <Button 
                onClick={handleUpload}
                disabled={!file || uploading || jobStatus === 'processing'}
                className="w-full bg-purple-600 text-white hover:bg-purple-700 sm:w-auto"
              >
                {uploading ? 'Uploading...' : jobStatus === 'processing' ? 'Processing...' : 'Upload and Process'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg p-6 text-white"
      >
        <h3 className="mb-3 text-xl font-medium">What happens after upload?</h3>
        <ul className="ml-5 list-disc space-y-2 text-white/70">
          <li>Your CSV file is securely uploaded to our server</li>
          <li>Our AI analyzes your dataset to identify missing values</li>
          <li>Multiple imputation techniques are applied based on data patterns</li>
          <li>Processing happens in the background, you'll get a notification when complete</li>
          <li>Download the completed dataset with imputed values</li>
        </ul>
      </motion.div>

      {/* Features section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          {
            title: "Multiple Techniques",
            description: "Uses various imputation methods tailored to your data type"
          },
          {
            title: "Fast Processing",
            description: "Process large datasets in minutes instead of hours"
          },
          {
            title: "High Accuracy",
            description: "Advanced algorithms for accurate missing value predictions"
          }
        ].map((feature, index) => (
          <div 
            key={index}
            className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg p-4 text-white"
          >
            <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
            <p className="text-sm text-white/60">{feature.description}</p>
          </div>
        ))}
      </motion.div>
    </div>

  );
};

export default Impute;