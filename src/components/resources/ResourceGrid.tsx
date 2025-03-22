
import { useState } from 'react';
import { File, Download, Share, MoreHorizontal, Trash, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { UploadedFile } from './FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResourceGridProps {
  resources: UploadedFile[];
  onDelete: (fileId: string) => void;
}

const ResourceGrid = ({ resources, onDelete }: ResourceGridProps) => {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const { user } = useAuth();
  
  const handleDownload = (file: UploadedFile) => {
    // Download file using its URL
    window.open(file.url, '_blank');
    toast.success(`Downloading ${file.name}`);
  };
  
  const handleShare = (file: UploadedFile) => {
    // Copy the file URL to clipboard
    navigator.clipboard.writeText(file.url);
    toast.success('Link copied to clipboard', {
      description: 'Share this link with others to access the file',
    });
  };
  
  const handlePreview = (file: UploadedFile) => {
    setPreviewFile(file);
  };
  
  const handleDelete = async (file: UploadedFile) => {
    try {
      // Delete the resource record from the database
      const { error: resourceError } = await supabase
        .from('resources')
        .delete()
        .eq('id', file.id);

      if (resourceError) throw resourceError;

      // Extract the file path from URL to delete from storage
      const fileUrl = file.url;
      const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/studysync\/(.+)$/);
      
      if (filePathMatch && filePathMatch[1]) {
        const filePath = decodeURIComponent(filePathMatch[1]);
        
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from('studysync')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue anyway, as we've already deleted the database record
        }
      }

      // Notify parent component
      onDelete(file.id);
      
      // Close preview if the deleted file is being previewed
      if (previewFile && previewFile.id === file.id) {
        setPreviewFile(null);
      }
      
      toast.success('File deleted');
    } catch (error: any) {
      console.error('Failed to delete resource:', error);
      toast.error('Failed to delete file', {
        description: error.message || 'Please try again later',
      });
    }
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
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
  };
  
  if (resources.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <File className="h-12 w-12 mx-auto mb-4 text-white-500 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No resources yet</h3>
        <p className="text-white-500 mb-4">
          Upload study materials to share with your group
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((file) => (
          <div 
            key={file.id} 
            className="glass rounded-lg overflow-hidden flex flex-col hover:translate-y-[-2px] transition-transform"
          >
            {/* Preview area */}
            <div 
              className="h-40 bg-white/5 flex items-center justify-center cursor-pointer"
              onClick={() => handlePreview(file)}
            >
              {file.type.startsWith('image/') && file.thumbnailUrl ? (
                <div className="w-full h-full overflow-hidden">
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-center p-4">
                  {getFileIcon(file.type)}
                  <p className="mt-2 text-white-500 text-sm truncate max-w-full">
                    {file.name}
                  </p>
                </div>
              )}
            </div>
            
            {/* File details */}
            <div className="p-4">
              <h3 className="font-medium truncate mb-1" title={file.name}>
                {file.name}
              </h3>
              <div className="text-sm text-white-500 mb-3 flex items-center justify-between">
                <span>{formatFileSize(file.size)}</span>
                <span>{format(file.uploadedAt, 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-white-500">
                  By {file.uploadedBy.name}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleShare(file)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(file)}>
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => handleDelete(file)}
                        disabled={user?.id !== file.uploadedBy.id}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* File preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {previewFile && getFileIcon(previewFile.type)}
              <div>
                <h3 className="text-lg font-semibold">
                  {previewFile?.name}
                </h3>
                <p className="text-sm text-white-500">
                  {previewFile && formatFileSize(previewFile.size)} • Uploaded by {previewFile?.uploadedBy.name}
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-white/5 min-h-[300px] flex items-center justify-center">
              {previewFile?.type.startsWith('image/') && previewFile.thumbnailUrl ? (
                <img 
                  src={previewFile.thumbnailUrl} 
                  alt={previewFile.name} 
                  className="max-w-full max-h-[500px] object-contain"
                />
              ) : previewFile?.type === 'application/pdf' ? (
                <div className="text-center">
                  <File className="h-16 w-16 mx-auto mb-4 text-red-500" />
                  <p className="mb-4">PDF Preview</p>
                  <Button onClick={() => handleDownload(previewFile)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <p className="mb-4">Preview not available</p>
                  <Button onClick={() => previewFile && handleDownload(previewFile)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPreviewFile(null)}>
                Close
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => previewFile && handleShare(previewFile)}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  onClick={() => previewFile && handleDownload(previewFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceGrid;
