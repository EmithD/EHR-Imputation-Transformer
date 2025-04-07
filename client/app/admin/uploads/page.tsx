'use client';

import AdminSideBar from '@/components/admin_sidebar';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IsAuth } from '../IsAuth';

type FileStatus = 'completed' | 'processing' | 'failed' | 'pending';

interface UploadFile {
  _id: string;
  userId: string;
  bEfileId: string;
  status: FileStatus;
  dateCreated: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const FASTAPI_BASE_URL = 'http://localhost:8000';
const NEST_BASE_URL = 'http://localhost:3000';

const UploadsPage = () => {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // First check authentication
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const authInstance = new IsAuth();
      const result = await authInstance.isAuthenticated();
      
      if (result.auth === false) {
        window.location.href = '/auth/login';
        return;
      } else {
        console.log("user:", result.userId);
        setUserId(result.userId);
        // Only fetch uploads after userId is set
        fetchUploads(result.userId);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Fetch uploads when refreshing
  const fetchUploads = async (id = userId) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const uploadsRaw = await fetch(`http://localhost:3000/api/v1/files/${id}`);
      
      // Check if response is ok before trying to parse JSON
      if (!uploadsRaw.ok) {
        const errorText = await uploadsRaw.text();
        console.error("API error:", errorText);
        setUploads([]);
        setIsLoading(false);
        return;
      }
      
      const data = await uploadsRaw.json();
      
      if (Array.isArray(data)) {
        setUploads(data);
      } else {
        console.error("API did not return an array:", data);
        setUploads([]);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
      setUploads([]);
    } finally {
      setIsLoading(false);
    }
  };
  
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

  const handleDelete = async (beid: string, deid: string) => {
    if (uploads) {
      await fetch (`${FASTAPI_BASE_URL}/api/v1/impute/${beid}`, {
        method: 'DELETE'
      });

      await fetch (`${NEST_BASE_URL}/api/v1/files/${deid}`, {
        method: 'DELETE'
      });

      setUploads(uploads.filter(upload => upload._id !== deid));
    }
  };

  const handleDownload = (id: string) => {
    console.log(`Downloading file ${id}`);
    window.open(`${FASTAPI_BASE_URL}/api/v1/impute/${id}/download`, '_blank');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUploads(); // Fetch the latest data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Calculate filtered uploads with null checks
  const filteredUploads = uploads.filter(upload => {
    if (!upload) return false;
    
    const fileIdMatch = upload.bEfileId && typeof upload.bEfileId === 'string' 
      ? upload.bEfileId.toLowerCase().includes(searchQuery.toLowerCase()) 
      : false;
      
    const idMatch = upload._id && typeof upload._id === 'string' 
      ? upload._id.toLowerCase().includes(searchQuery.toLowerCase()) 
      : false;
      
    return fileIdMatch || idMatch;
  });

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
            disabled={isLoading || !userId}
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

                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">File Identifier</th>
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">Status</th>
                    <th className="py-3 px-4 text-left text-white/70 font-medium text-sm">Uploaded</th>
                    <th className="py-3 px-4 text-right text-white/70 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/60">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredUploads.length > 0 ? (
                    filteredUploads.map((upload, index) => (
                      <tr 
                        key={upload._id} 
                        className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                          index % 2 === 0 ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center">
                            {upload.bEfileId}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{getStatusBadge(upload.status as FileStatus)}</td>
                        <td className="py-3 px-4 text-sm text-white/70">{new Date(upload.dateCreated).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => handleDownload(upload.bEfileId)}
                              disabled={upload.status === 'processing' || upload.status === 'pending'}
                            >
                              <Download size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-white/70 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDelete(upload.bEfileId, upload._id)}
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
            
            {filteredUploads.length > 0 && (
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