
#!/usr/bin/env node

/**
 * This script creates demo users for testing purposes.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://sdhgfhqamtbbmiyvtfvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaGdmaHFhbXRiYm1peXZ0ZnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA2MTU0NCwiZXhwIjoyMDU3NjM3NTQ0fQ.q6VWjIKlXuI--VzOMWTYOhVZgWpe3Mmx-4JWaOGMkTQ'; // Replace with your service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Demo users
const demoUsers = [
  {
    email: 'alice@example.com',
    password: 'password123',
    userData: {
      name: 'Alice Johnson',
      academic_level: 'Undergraduate',
      subject_interests: ['Computer Science', 'Mathematics'],
      bio: 'Computer Science student interested in AI and machine learning.',
      study_preferences: { timeOfDay: 'evening', groupSize: 3 }
    }
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    userData: {
      name: 'Bob Smith',
      academic_level: 'Graduate',
      subject_interests: ['Physics', 'Engineering'],
      bio: 'Physics grad student working on quantum mechanics research.',
      study_preferences: { timeOfDay: 'morning', groupSize: 2 }
    }
  },
  {
    email: 'charlie@example.com',
    password: 'password123',
    userData: {
      name: 'Charlie Davis',
      academic_level: 'High School',
      subject_interests: ['Biology', 'Chemistry'],
      bio: 'High school student preparing for college applications.',
      study_preferences: { timeOfDay: 'afternoon', groupSize: 5 }
    }
  }
];

// Sample study groups
const studyGroups = [
  {
    name: 'Algorithms Study Group',
    description: 'Weekly meetings to discuss and solve algorithm problems',
    subject: 'Computer Science',
    subject_tags: ['Algorithms', 'Data Structures', 'Programming'],
    is_public: true,
    capacity: 15
  },
  {
    name: 'Quantum Physics Discussion',
    description: 'Deep dive into quantum mechanics and related topics',
    subject: 'Physics',
    subject_tags: ['Quantum Mechanics', 'Theoretical Physics'],
    is_public: true,
    capacity: 10
  },
  {
    name: 'Biology Exam Prep',
    description: 'Preparing for biology exams and discussing key concepts',
    subject: 'Biology',
    subject_tags: ['Anatomy', 'Molecular Biology', 'Genetics'],
    is_public: true,
    capacity: 20
  }
];

async function createUsers() {
  console.log('Creating demo users...');
  
  const createdUsers = [];
  
  for (const user of demoUsers) {
    try {
      // Create user with email and password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true // Skip email verification
      });
      
      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError);
        continue;
      }
      
      console.log(`Created user: ${user.email}`);
      
      // Update the user's profile with additional data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: user.userData.name,
          academic_level: user.userData.academic_level,
          subject_interests: user.userData.subject_interests,
          bio: user.userData.bio,
          study_preferences: user.userData.study_preferences
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error(`Error updating profile for ${user.email}:`, updateError);
      } else {
        console.log(`Updated profile for: ${user.email}`);
      }
      
      createdUsers.push(authData.user);
    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error);
    }
  }
  
  return createdUsers;
}

async function createGroups(users) {
  console.log('\nCreating study groups...');
  
  const createdGroups = [];
  
  // Create each group
  for (let i = 0; i < studyGroups.length; i++) {
    const group = studyGroups[i];
    // Use a different user as the creator for each group
    const creatorIndex = i % users.length;
    const creator = users[creatorIndex];
    
    try {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert(group)
        .select()
        .single();
      
      if (groupError) {
        console.error(`Error creating group "${group.name}":`, groupError);
        continue;
      }
      
      console.log(`Created group: ${group.name}`);
      createdGroups.push(groupData);
      
      // Add the creator as an admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          user_id: creator.id,
          group_id: groupData.id,
          role: 'admin'
        });
      
      if (memberError) {
        console.error(`Error adding creator to group "${group.name}":`, memberError);
      }
      
      // Add other users as members
      for (const user of users) {
        // Skip the creator who is already added as admin
        if (user.id === creator.id) continue;
        
        const { error: otherMemberError } = await supabase
          .from('group_members')
          .insert({
            user_id: user.id,
            group_id: groupData.id,
            role: 'member'
          });
        
        if (otherMemberError) {
          console.error(`Error adding user ${user.id} to group "${group.name}":`, otherMemberError);
        }
      }
      
      console.log(`Added all users to group: ${group.name}`);
    } catch (error) {
      console.error(`Unexpected error creating group "${group.name}":`, error);
    }
  }
  
  return createdGroups;
}

async function addSampleData(users, groups) {
  console.log('\nAdding sample messages...');
  
  // Add some messages to each group
  for (const group of groups) {
    for (let i = 0; i < 5; i++) {
      const user = users[i % users.length];
      const message = {
        content: `This is message #${i+1} in the ${group.name} group.`,
        user_id: user.id,
        group_id: group.id
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(message);
      
      if (error) {
        console.error(`Error adding message to group "${group.name}":`, error);
      }
    }
    console.log(`Added sample messages to group: ${group.name}`);
  }
  
  console.log('\nAdding sample study sessions...');
  
  // Add a study session to each group
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const host = users[i % users.length];
    
    // Create a session starting tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM
    
    const endTime = new Date(tomorrow);
    endTime.setHours(16, 0, 0, 0); // 4 PM
    
    const session = {
      title: `${group.subject} Study Session`,
      description: `Let's review key concepts in ${group.subject}`,
      start_time: tomorrow.toISOString(),
      end_time: endTime.toISOString(),
      location: 'University Library, Room 202',
      group_id: group.id,
      host_id: host.id
    };
    
    const { data: sessionData, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating session for group "${group.name}":`, error);
      continue;
    }
    
    console.log(`Created session for group: ${group.name}`);
    
    // Add users as attendees with different statuses
    for (let j = 0; j < users.length; j++) {
      const user = users[j];
      // Rotate through confirmed, tentative, declined
      const statuses = ['confirmed', 'tentative', 'declined'];
      const status = statuses[j % 3];
      
      const { error: attendeeError } = await supabase
        .from('session_attendees')
        .insert({
          session_id: sessionData.id,
          user_id: user.id,
          status: status
        });
      
      if (attendeeError) {
        console.error(`Error adding attendee to session for group "${group.name}":`, attendeeError);
      }
    }
    
    console.log(`Added attendees to session for group: ${group.name}`);
  }
}

async function main() {
  try {
    console.log('======= Creating Demo Data =======');
    const users = await createUsers();
    
    if (users.length > 0) {
      const groups = await createGroups(users);
      
      if (groups.length > 0) {
        await addSampleData(users, groups);
      }
    }
    
    console.log('\n======= Demo Data Creation Complete =======');
    console.log('You can now log in with any of these accounts:');
    demoUsers.forEach(user => {
      console.log(`- Email: ${user.email}, Password: ${user.password}`);
    });
  } catch (error) {
    console.error('Failed to create demo data:', error);
  }
}

// Run the script
main();
