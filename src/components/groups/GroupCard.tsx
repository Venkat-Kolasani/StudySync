
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

interface GroupCardProps {
  group: StudyGroup;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const percentFull = (group.members / group.capacity) * 100;
  
  return (
    <Card className="glass hover:shadow-lg overflow-hidden transition-all duration-300">
      <div className="relative h-32 overflow-hidden">
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${
            group.subject.includes('Computer') ? 'from-blue-600 to-indigo-600' :
            group.subject.includes('Math') ? 'from-green-600 to-teal-600' :
            group.subject.includes('Physics') ? 'from-purple-600 to-indigo-600' :
            group.subject.includes('Biology') ? 'from-emerald-600 to-green-600' :
            group.subject.includes('Chemistry') ? 'from-rose-600 to-pink-600' :
            group.subject.includes('Literature') ? 'from-amber-600 to-yellow-600' :
            group.subject.includes('History') ? 'from-red-600 to-orange-600' :
            'from-violet-600 to-purple-600'
          }`}
        />
        
        {group.image && (
          <img 
            src={group.image} 
            alt={group.name} 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          />
        )}
        
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/40 hover:bg-black/60">
            {group.subject}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl leading-tight">{group.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {group.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {group.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-transparent">
              {tag}
            </Badge>
          ))}
          {group.tags.length > 3 && (
            <Badge variant="outline" className="text-xs bg-transparent">
              +{group.tags.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-white-500" />
              <span>
                {group.members} / {group.capacity} members
              </span>
            </div>
            <span className={percentFull > 80 ? 'text-destructive' : ''}>
              {percentFull > 80 ? 'Almost full' : 'Open'}
            </span>
          </div>
          <Progress value={percentFull} className="h-1.5" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="default" className="w-full group">
          <span>View Group</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
