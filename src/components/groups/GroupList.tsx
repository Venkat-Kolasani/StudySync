
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GroupCard from './GroupCard';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  capacity: number;
  image?: string;
  tags: string[];
}

interface GroupListProps {
  groups: StudyGroup[];
}

const GroupList = ({ groups }: GroupListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                         
    const matchesSubject = subjectFilter === 'all' || group.subject === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Literature', 'History', 'Economics'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for study groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 focus-ring"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={subjectFilter}
            onValueChange={setSubjectFilter}
          >
            <SelectTrigger className="w-[180px] focus-ring">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="focus-ring">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Advanced filters</span>
          </Button>
        </div>
      </div>
      
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No study groups found</h3>
          <p className="text-white-500 mt-2">Try adjusting your search or filters</p>
          <Button className="mt-4">Create a New Group</Button>
        </div>
      )}
    </div>
  );
};

export default GroupList;
