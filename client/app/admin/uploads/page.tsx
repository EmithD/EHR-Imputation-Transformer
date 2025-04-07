'use client';

import AdminSideBar from '@/components/admin_sidebar';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Define file status type
type FileStatus = 'completed' | 'processing' | 'failed' | 'pending';

// Define upload file type
interface UploadFile {
  id: string;
  fileName: string;
  status: FileStatus;
  size: string;
  date: string;
}

// Sample data for the table
const initialUploads: UploadFile[] = [
  { id: 'FILE-7832', fileName: 'patient_data_2024.xlsx', status: 'completed', size: '4.2 MB', date: '2 hours ago' },
  { id: 'FILE-6391', fileName: 'hospital_records.csv', status: 'processing', size: '8.7 MB', date: '5 hours ago' },
  { id: 'FILE-5472', fileName: 'clinical_trials.xlsx', status: 'completed', size: '12.1 MB', date: '1 day ago' },
  { id: 'FILE-4283', fileName: 'medical_imaging_data.csv', status: 'failed', size: '6.5 MB', date: '2 days ago' },
  { id: 'FILE-3194', fileName: 'genomic_sequences.xlsx', status: 'completed', size: '15.3 MB', date: '3 days ago' },
  { id: 'FILE-2057', fileName: 'pharmacy_inventory.csv', status: 'pending', size: '3.8 MB', date: '4 days ago' },
];

const UploadsPage = () => {
  const [uploads, setUploads] = useState(initialUploads);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status badge styling
  const getStatusBadge = (status: FileStatus) => {
    const statusStyles: Record<FileStatus, string> = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };

    return (
      <Badge className={`${statusStyles[status]} border px-2 py-0.5 rounded-full text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Handle file deletion
  const handleDelete = (id: string) => {
    setUploads(uploads.filter(upload => upload.id !== id));
  };

  // Handle file download
  const handleDownload = (id: string) => {
    // Download logic here
    console.log(`Downloading file ${id}`);
    // In a real application, this would trigger a download
  };

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter uploads based on search query
  const filteredUploads = uploads.filter(upload => 
    upload.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminSideBar>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 lg:p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Uploads</h1>
            <p className="text-white/60">Manage your uploaded files</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white shadow-xl mb-6">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl">Your Files</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <Input
                  placeholder="Search files..."
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">File ID</th>
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">File Name</th>
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">Status</th>
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">Size</th>
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">Uploaded</th>
                    <th className="py-3 px-4 text-right text-white/70 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUploads.length > 0 ? (
                    filteredUploads.map((upload, index) => (
                      <tr 
                        key={upload.id} 
                        className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                          index % 2 === 0 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm font-medium">{upload.id}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            <FileText size={16} className="text-purple-400 mr-2" />
                            {upload.fileName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{getStatusBadge(upload.status)}</td>
                        <td className="py-3 px-4 text-sm text-white/70">{upload.size}</td>
                        <td className="py-3 px-4 text-sm text-white/70">{upload.date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => handleDownload(upload.id)}
                              disabled={upload.status === 'processing' || upload.status === 'pending'}
                            >
                              <Download size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDelete(upload.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/60">
                        {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {uploads.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-sm text-white/60">
                <div>Showing {filteredUploads.length} of {uploads.length} files</div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    disabled
                  >
                    Previous
                  </Button>
                  <span className="mx-2">Page 1 of 1</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    disabled
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AdminSideBar>
  );
};

export default UploadsPage;