
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BookOpen, Calendar, Clock, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/shared/PageTransition';

const Dashboard = () => {
  // Mock data for dashboard
  const upcomingSessions = [
    { id: '1', name: 'Calculus Study Group', date: 'Today', time: '3:00 PM', subject: 'Mathematics' },
    { id: '2', name: 'Data Structures Review', date: 'Tomorrow', time: '5:30 PM', subject: 'Computer Science' },
    { id: '3', name: 'Physics Lab Prep', date: 'Fri, Jun 24', time: '2:00 PM', subject: 'Physics' },
  ];
  
  const myGroups = [
    { id: '1', name: 'Advanced Calculus', members: 8, subject: 'Mathematics' },
    { id: '2', name: 'Algorithm Design', members: 5, subject: 'Computer Science' },
    { id: '3', name: 'Quantum Physics', members: 6, subject: 'Physics' },
  ];
  
  const notifications = [
    { id: '1', message: 'New message in Advanced Calculus', time: '10 min ago' },
    { id: '2', message: 'Algorithm Design session rescheduled', time: '1 hour ago' },
    { id: '3', message: 'Lisa shared new resources in Quantum Physics', time: '3 hours ago' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <PageTransition>
        <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-white-500 mt-1">Welcome back! Here's what's happening with your study groups.</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - 2/3 width on larger screens */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Study Sessions */}
              <section>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Upcoming Study Sessions
                    </h2>
                    <p className="text-white-500 text-sm mt-1">Your scheduled sessions for this week</p>
                  </div>
                  <Button size="sm" variant="outline" className="focus-ring">
                    View All
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <motion.div 
                      key={session.id}
                      className="glass rounded-lg p-4 hover:bg-secondary/30 transition-all duration-200"
                      whileHover={{ translateX: 5 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{session.name}</h3>
                          <div className="flex items-center text-sm text-white-500 mt-1">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            <span>{session.date} at {session.time}</span>
                          </div>
                        </div>
                        <Badge>{session.subject}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
              
              {/* My Study Groups */}
              <section>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      My Study Groups
                    </h2>
                    <p className="text-white-500 text-sm mt-1">Groups you're currently a part of</p>
                  </div>
                  <Button variant="outline" size="sm" className="focus-ring">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create New
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myGroups.map((group) => (
                    <motion.div 
                      key={group.id}
                      className="glass rounded-lg p-5 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Badge className="mb-2">{group.subject}</Badge>
                      <h3 className="font-medium text-lg">{group.name}</h3>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-white-500">
                          <Users className="inline mr-1.5 h-4 w-4" />
                          {group.members} members
                        </span>
                        <Button variant="ghost" size="sm" className="text-sm focus-ring">
                          View Group
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  
                  <motion.div 
                    className="glass-dark border border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center h-[150px]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Plus className="h-8 w-8 text-white-500 mb-3" />
                    <p className="text-white-500 mb-2">Looking for more groups?</p>
                    <Button variant="outline" size="sm">
                      Browse Study Groups
                    </Button>
                  </motion.div>
                </div>
              </section>
              
              {/* Recent Activity or Resources */}
              <section>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Recent Study Materials
                    </h2>
                    <p className="text-white-500 text-sm mt-1">Resources shared in your groups</p>
                  </div>
                  <Button variant="ghost" size="sm" className="focus-ring">
                    View All
                  </Button>
                </div>
                
                <div className="glass p-6 rounded-xl">
                  <p className="text-center text-white-500 py-8">
                    No recent study materials
                  </p>
                  <div className="flex justify-center">
                    <Button variant="outline">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Share a Resource
                    </Button>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Sidebar - 1/3 width on larger screens */}
            <div className="space-y-8">
              {/* Welcome Card / Stats */}
              <section className="glass rounded-xl p-6 bg-gradient-to-br from-secondary/50 to-black/50">
                <h2 className="text-xl font-bold mb-3">Weekly Stats</h2>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="glass-dark rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent">3</div>
                    <div className="text-sm text-white-500">Active Groups</div>
                  </div>
                  <div className="glass-dark rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent">5</div>
                    <div className="text-sm text-white-500">Study Hours</div>
                  </div>
                  <div className="glass-dark rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent">12</div>
                    <div className="text-sm text-white-500">Resources</div>
                  </div>
                  <div className="glass-dark rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent">8</div>
                    <div className="text-sm text-white-500">Contributions</div>
                  </div>
                </div>
              </section>
              
              {/* Notifications */}
              <section className="glass rounded-xl overflow-hidden">
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifications
                  </h2>
                  <Badge variant="outline" className="bg-transparent">
                    {notifications.length}
                  </Badge>
                </div>
                
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-white/5 transition-colors">
                      <p className="text-sm">{notification.message}</p>
                      <span className="text-xs text-white-500 mt-1 block">{notification.time}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t border-white/10 bg-black-300/50">
                  <Button variant="ghost" size="sm" className="w-full text-sm focus-ring">
                    View All Notifications
                  </Button>
                </div>
              </section>
              
              {/* Quick Actions or Tips */}
              <section className="glass-dark rounded-xl p-6">
                <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Study Session
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Invite Friends
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Upload Study Material
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Dashboard;
