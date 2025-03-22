import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Calendar, Globe, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomNavbar from '@/components/layout/CustomNavbar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 py-1.5 px-4 text-sm bg-accent/20 hover:bg-accent/30 text-white border-accent/30">
            Collaborative Learning Platform
          </Badge>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold leading-tight md:leading-tight text-gradient mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Learn Better, Together with StudySync
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white-500 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Form study groups, communicate in real-time, and share resources on a centralized platform designed to enhance your learning experience.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" className="group" onClick={() => window.location.href = '/dashboard'}>
              <span>Get Started</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/profile'}>
              View Profile
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-secondary/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 py-1.5 px-4 text-sm bg-accent/20 hover:bg-accent/30 text-white border-accent/30">
              Key Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything you need for effective group studying
            </h2>
            <p className="text-lg text-white-500 max-w-2xl mx-auto">
              StudySync brings together all the tools you need to collaborate effectively with your peers and enhance your learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6" />}
              title="Subject-Specific Groups"
              description="Form or join groups focused on specific subjects, courses, or topics to collaborate with like-minded peers."
            />
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Collaborative Learning"
              description="Share notes, discuss concepts, and solve problems together in a centralized platform."
            />
            <FeatureCard 
              icon={<Calendar className="h-6 w-6" />}
              title="Study Session Scheduling"
              description="Plan and organize study sessions with automated reminders and calendar integration."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6" />}
              title="Resource Sharing"
              description="Easily exchange study materials, articles, videos, and other helpful resources."
            />
            <FeatureCard 
              icon={<Star className="h-6 w-6" />}
              title="Personalized Profiles"
              description="Showcase your academic interests, expertise areas, and study preferences."
            />
            <FeatureCard 
              icon={<Check className="h-6 w-6" />}
              title="Progress Tracking"
              description="Set goals, track your progress, and celebrate achievements with your study groups."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Ready to transform your learning experience?</h2>
                <p className="text-white-500 mb-6">
                  Join StudySync today and connect with students who share your academic goals and interests.
                </p>
                <Button size="lg" className="group" onClick={() => window.location.href = '/dashboard'}>
                  <span>Get Started Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              
              <div className="hidden md:block glass-dark rounded-xl overflow-hidden h-64 bg-gradient-to-br from-violet-800/20 to-indigo-800/20">
                {/* Placeholder for image or illustration */}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black-300 py-8 px-4 md:px-8 mt-auto">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white-500 text-sm">
            © {new Date().getFullYear()} StudySync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <motion.div 
      className="glass-dark rounded-xl p-6 hover:translate-y-[-5px] transition-all duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white-500">{description}</p>
    </motion.div>
  );
};

export default Index;
