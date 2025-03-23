import { useState, useRef } from 'react';
import { X, Upload, File, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShareResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string; // Optional: if sharing to a specific group
}

const ShareResourceModal = ({ isOpen, onClose, groupId }: ShareResourceModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 5) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle file upload to Supabase storage
  const uploadFile = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your resource.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      // For testing purposes, using a default user ID
      const testUserId = '12345';

      // Upload file to Supabase Storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('study-resources')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('study-resources')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Save resource metadata to the database
      const resourceData = {
        title,
        description,
        file_url: publicUrl,
        file_type: fileExt || 'unknown',
        group_id: groupId || null,
        user_id: testUserId,
        created_at: new Date().toISOString(),
        tags,
      };

      const { data: resource, error: dbError } = await supabase
        .from('resources')
        .insert([resourceData])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      toast({
        title: 'Resource shared successfully',
        description: 'Your file has been uploaded and shared.',
      });

      // Reset form and close modal
      setTitle('');
      setDescription('');
      setTags([]);
      setSelectedFile(null);
      setUploadProgress(100);
      setTimeout(() => {
        onClose();
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error: any) {
      console.error('Error uploading resource:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="glass w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Share a Resource</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${selectedFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-white/40'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <Check className="h-8 w-8 text-green-500 mb-2" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-white-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-white-500 mb-2" />
                  <p className="font-medium">Click to upload a file</p>
                  <p className="text-sm text-white-500 mt-1">
                    PDF, DOCX, PPTX, or images up to 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your resource"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this resource contains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none min-h-[100px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="Add tags and press Enter (max 5)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} className="px-2 py-1 flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={uploadFile} disabled={isUploading || !selectedFile}>
              {isUploading ? 'Uploading...' : 'Share Resource'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareResourceModal;
