
import { useState } from 'react';
import { X, Plus, Upload, Users, Lock, Unlock } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(50, "Group name must be less than 50 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  subject: z.string().min(1, "Please select a subject"),
  capacity: z.number().min(5).max(30),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface GroupFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

const GroupForm = ({ onSubmit, isSubmitting = false }: GroupFormProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Initialize form
  // Initialize form with validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      subject: '',
      capacity: 10,
      isPrivate: false,
      tags: [],
    },
  });

  // Subjects list
  const subjects = [
    'Computer Science', 
    'Mathematics', 
    'Physics', 
    'Chemistry', 
    'Biology', 
    'Literature',
    'History',
    'Economics',
    'Psychology',
    'Art & Design',
    'Business',
    'Engineering',
    'Medicine',
    'Law',
  ];
  
  // Handle tags
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag !== '' && !tags.includes(trimmedTag) && tags.length < 10) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setTagInput('');
      // Update form value
      form.setValue('tags', newTags, { shouldValidate: true });
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (values: FormData) => {
    console.log('Form values:', values);
    // Ensure tags are included in the submission
    const formData = {
      ...values,
      tags: tags, // Use the tags from state
    };
    console.log('Submitting form data:', formData);
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Advanced Calculus Study Group" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what your group will focus on, study methods, goals, etc." 
                  className="resize-none min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Subject</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Member Capacity</FormLabel>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-white-500" />
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map(num => (
                        <SelectItem key={num} value={String(num)}>{num} members</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex mt-2 mb-3">
            <Input
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="ml-2"
              onClick={addTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-sm py-1.5 pr-1.5">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag}</span>
                </Button>
              </Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-white-500 text-sm">Add up to 10 tags to help others find your group.</p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {field.value ? (
                    <Lock className="h-4 w-4 inline-block mr-2" />
                  ) : (
                    <Unlock className="h-4 w-4 inline-block mr-2" />
                  )}
                  {field.value ? 'Private Group' : 'Public Group'}
                </FormLabel>
                <FormDescription>
                  {field.value 
                    ? 'Members can only join with an invitation code.' 
                    : 'Anyone can discover and join your group.'}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="glass-dark rounded-lg p-4 flex items-center">
          <div className="h-16 w-16 bg-secondary rounded-md flex items-center justify-center mr-4">
            <Upload className="h-6 w-6 text-white-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">Group Image (Optional)</h3>
            <p className="text-xs text-white-500 mb-2">Upload a cover image for your group.</p>
            <Button type="button" variant="outline" size="sm">
              Choose File
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating Study Group..." : "Create Study Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GroupForm;
