'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/app/context/UserContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Wrap fetchUploads in useCallback to memoize it
  const fetchUploads = useCallback(async (id = user?.id) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const uploadsRaw = await fetch(`${NEST_BASE_URL}/api/v1/files/${id}`);

      console.log("ID: ", id);

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
  }, [user?.id]); // Only depend on user?.id, not the entire user object

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]); // Now fetchUploads is stable and won't cause re-renders
  
  const getStatusBadge = (status: FileStatus) => {
    const statusStyles: Record<FileStatus, string> = {
      completed: 'bg-green-100 text-green-700 border-green-300',
      processing: 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse',
      failed: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };

    return (
      <Badge className={`${statusStyles[status]} border px-2 py-0.5 rounded-full text-xs font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDelete = async (beid: string, deid: string) => {
    if (uploads) {
      try {
        await fetch(`${FASTAPI_BASE_URL}/api/v1/impute/${beid}`, {
          method: 'DELETE'
        });

        await fetch(`${NEST_BASE_URL}/api/v1/files/${deid}`, {
          method: 'DELETE'
        });

        setUploads(uploads.filter(upload => upload._id !== deid));
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDownload = (id: string) => {
    console.log(`Downloading file ${id}`);
    window.open(`${FASTAPI_BASE_URL}/api/v1/impute/${id}/download`, '_blank');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUploads();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Uploads</h1>
          <p className="text-slate-600">Manage your uploaded files</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          disabled={isLoading || !user?.id}
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-md mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl text-slate-800">Your Files</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search files..."
                className="pl-9 bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 w-full"
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
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-slate-500 font-medium text-sm">File Identifier</th>
                  <th className="py-3 px-4 text-left text-slate-500 font-medium text-sm">Status</th>
                  <th className="py-3 px-4 text-left text-slate-500 font-medium text-sm">Uploaded</th>
                  <th className="py-3 px-4 text-right text-slate-500 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : !user?.id ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      User information is loading...
                    </td>
                  </tr>
                ) : filteredUploads.length > 0 ? (
                  filteredUploads.map((upload, index) => (
                    <tr 
                      key={upload._id} 
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-slate-700">
                        <div className="flex items-center">
                          {upload.bEfileId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(upload.status as FileStatus)}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{new Date(upload.dateCreated).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleDownload(upload.bEfileId)}
                            disabled={upload.status === 'processing' || upload.status === 'pending'}
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-700 hover:bg-red-50"
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
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {searchQuery ? 'No files match your search' : 'No files uploaded yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredUploads.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
              <div>Showing {filteredUploads.length} of {uploads.length} files</div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  disabled
                >
                  Previous
                </Button>
                <span className="mx-2">Page 1 of 1</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
  );
};

export default UploadsPage;