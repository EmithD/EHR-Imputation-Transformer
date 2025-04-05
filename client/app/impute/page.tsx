"use client";

import HeaderFooter from '@/components/header_footer';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Impute = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<String | null>(null); // 'success', 'error', or null
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // Simulate upload process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <HeaderFooter>
      <div className="relative mx-auto my-10 flex max-w-4xl flex-col items-center justify-center px-4 py-10 md:py-20">
        {/* Decorative elements */}
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
            Upload your Excel dataset and let our AI fill in missing data
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
              <CardTitle className="text-xl text-white">Upload Excel File</CardTitle>
              <CardDescription className="text-white/60">
                We support .xlsx and .csv file formats
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
                    accept=".xlsx,.xls,.csv"
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
                      <p className="text-center text-white">Drag and drop your file here</p>
                      <p className="text-center text-sm text-white/60">
                        or click to browse
                      </p>
                    </div>
                  )}
                </div>
                
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
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
              <Button 
                onClick={triggerFileInput}
                className="w-full border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                Choose File
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-purple-600 text-white hover:bg-purple-700 sm:w-auto"
              >
                {uploading ? 'Uploading...' : 'Upload and Process'}
              </Button>
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
            <li>Our AI analyzes your dataset to identify missing values</li>
            <li>Multiple imputation techniques are applied based on data patterns</li>
            <li>You can review and approve the imputed values</li>
            <li>Download the completed dataset in your preferred format</li>
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
    </HeaderFooter>
  );
};

export default Impute;