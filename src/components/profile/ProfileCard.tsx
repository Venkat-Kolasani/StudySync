
import { useState } from 'react';
import { User, Calendar, Book, MapPin, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  academicLevel: string;
  joinedDate: string;
  location?: string;
  bio: string;
  interests: string[];
  expertise: string[];
  studyPreferences: {
    timeOfDay: string;
    groupSize: string | number;
  };
}

interface ProfileCardProps {
  profile: UserProfile;
  isCurrentUser?: boolean;
  onUpdate?: (data: any) => void;
}

const ProfileCard = ({ profile, isCurrentUser = false, onUpdate }: ProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [newInterest, setNewInterest] = useState('');
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset to original values if canceling
    if (isEditing) {
      setEditedProfile(profile);
    }
  };
  
  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedProfile);
    }
    setIsEditing(false);
  };
  
  const handleChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePreferenceChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      studyPreferences: {
        ...prev.studyPreferences,
        [field]: value
      }
    }));
  };
  
  const addInterest = () => {
    if (newInterest.trim() && !editedProfile.interests.includes(newInterest.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };
  
  const removeInterest = (interest: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-32 bg-gradient-to-r from-violet-600 to-indigo-600">
        {isCurrentUser && !isEditing && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-black/20 border-white/20 hover:bg-black/40 focus-ring"
            onClick={toggleEdit}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        )}
        
        {isCurrentUser && isEditing && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full bg-black/20 border-white/20 hover:bg-black/40 focus-ring"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Save Changes</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="rounded-full bg-black/20 border-white/20 hover:bg-black/40 focus-ring"
              onClick={toggleEdit}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col items-center -mt-14">
          <Avatar className="h-28 w-28 border-4 border-background shadow-md">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-accent text-2xl">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="mt-4 w-full max-w-xs">
              <Input 
                className="text-center"
                value={editedProfile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your name"
              />
            </div>
          ) : (
            <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>
          )}
          
          <div className="mt-2 flex items-center text-sm text-white-500">
            <Book className="mr-1 h-4 w-4" />
            {isEditing ? (
              <Select 
                value={editedProfile.academicLevel}
                onValueChange={(value) => handleChange('academicLevel', value)}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Academic level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School Student">High School Student</SelectItem>
                  <SelectItem value="Undergraduate Student">Undergraduate Student</SelectItem>
                  <SelectItem value="Graduate Student">Graduate Student</SelectItem>
                  <SelectItem value="PhD Student">PhD Student</SelectItem>
                  <SelectItem value="Teacher/Professor">Teacher/Professor</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span>{profile.academicLevel}</span>
            )}
            
            {profile.location && !isEditing && (
              <>
                <span className="mx-2">•</span>
                <MapPin className="mr-1 h-4 w-4" />
                <span>{profile.location}</span>
              </>
            )}
            
            {!isEditing && (
              <>
                <span className="mx-2">•</span>
                <Calendar className="mr-1 h-4 w-4" />
                <span>Joined {profile.joinedDate}</span>
              </>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-4 w-full max-w-md">
              <Textarea 
                className="min-h-[100px]"
                value={editedProfile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Write a short bio about yourself..."
              />
            </div>
          ) : (
            <p className="mt-4 text-center text-white-500 max-w-md">
              {profile.bio}
            </p>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white-500 mb-2">Interests</h3>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add a new interest"
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={addInterest}
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editedProfile.interests.map((interest, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="bg-secondary/50 pr-1.5"
                      >
                        {interest}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-full"
                          onClick={() => removeInterest(interest)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.length > 0 ? (
                    profile.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary" className="bg-secondary/50">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-white-500">No interests specified</p>
                  )}
                </div>
              )}
            </div>
            
            {!isEditing && profile.expertise.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white-500 mb-2">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((area, i) => (
                    <Badge key={i} variant="outline" className="border-accent/50 text-white">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white-500 mb-2">Study Preferences</h3>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs">Time of Day</label>
                    <Select 
                      value={editedProfile.studyPreferences.timeOfDay}
                      onValueChange={(value) => handlePreferenceChange('timeOfDay', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Time of day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Afternoon">Afternoon</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                        <SelectItem value="Any time">Any time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs">Group Size</label>
                    <Select 
                      value={String(editedProfile.studyPreferences.groupSize)}
                      onValueChange={(value) => handlePreferenceChange('groupSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Group size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Pair (2)</SelectItem>
                        <SelectItem value="5">Small (3-5)</SelectItem>
                        <SelectItem value="10">Medium (6-10)</SelectItem>
                        <SelectItem value="20">Large (11-20)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-dark rounded-lg p-3">
                    <div className="text-xs text-white-500">Time of Day</div>
                    <div className="font-medium">{profile.studyPreferences.timeOfDay}</div>
                  </div>
                  <div className="glass-dark rounded-lg p-3">
                    <div className="text-xs text-white-500">Group Size</div>
                    <div className="font-medium">{profile.studyPreferences.groupSize}</div>
                  </div>
                </div>
              )}
            </div>
            
            {isCurrentUser && !isEditing && (
              <Button className="w-full mt-4" variant="outline" onClick={toggleEdit}>
                <User className="mr-2 h-4 w-4" />
                Edit Your Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
