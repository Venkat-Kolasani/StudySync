
import { useState, useRef } from 'react';
import { Upload, File, FileText, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  groupId: string;
  onUploadComplete: (file: UploadedFile) => void;
}

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
};

const FileUpload = ({ groupId, onUploadComplete }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB',
      });
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type', {
        description: 'Please upload a PDF, image, or document file',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file path in the storage bucket
      const fileExtension = selectedFile.name.split('.').pop();
      const filePath = `group-${groupId}/${uuidv4()}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('studysync')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Simulate upload progress since we can't track it directly
      let progress = 0;
      const intervalId = setInterval(() => {
        progress += 10;
        setUploadProgress(Math.min(progress, 95));
        if (progress >= 95) clearInterval(intervalId);
      }, 300);

      // Get the public URL for the file
      const { data: urlData } = supabase.storage.from('studysync').getPublicUrl(filePath);
      const fileUrl = urlData.publicUrl;
      
      // Create a resource record in the database
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .insert({
          title: selectedFile.name,
          description: null,
          file_url: fileUrl,
          file_type: selectedFile.type,
          group_id: groupId,
          user_id: user.id,
          tags: [],
        })
        .select()
        .single();

      if (resourceError) throw resourceError;
      
      clearInterval(intervalId);

      // Provide the thumbnailUrl for images
      let thumbnailUrl;
      if (selectedFile.type.startsWith('image/')) {
        thumbnailUrl = fileUrl;
      }

      // Create uploaded file object for the UI
      const uploadedFile: UploadedFile = {
        id: resourceData.id,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        url: fileUrl,
        thumbnailUrl,
        uploadedAt: new Date(),
        uploadedBy: {
          id: user.id,
          name: user.name,
        },
      };

      // Complete the upload
      setUploadProgress(100);
      
      // Notify parent component
      onUploadComplete(uploadedFile);
      
      // Reset state
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error('Upload failed', {
        description: error.message || 'There was an error uploading your file. Please try again.',
      });
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <File className="h-8 w-8 text-red-500" />;
    } else {
      return <FileText className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Resources</h2>
      
      {!selectedFile ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-white/20 hover:border-white/40'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-white-500" />
          <h3 className="text-lg font-medium mb-2">Drag & Drop Files</h3>
          <p className="text-white-500 mb-4">
            Drop files here or click to browse
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Browse Files
          </Button>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden"
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            {getFileIcon(selectedFile.type)}
            <div className="ml-3 flex-1">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-sm text-white-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            {!isUploading && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isUploading && (
            <div className="mb-4">
              <Progress value={uploadProgress} className="h-2" />
              <div className="text-sm text-white-500 mt-2">
                Uploading... {Math.round(uploadProgress)}%
              </div>
            </div>
          )}
          
          {!isUploading && (
            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={!user}
            >
              Upload File
            </Button>
          )}
        </div>
      )}
      
      <div className="mt-4 text-sm text-white-500">
        <p>Supported file types: PDF, Word, Images (JPG, PNG, GIF)</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  );
};

export default FileUpload;
