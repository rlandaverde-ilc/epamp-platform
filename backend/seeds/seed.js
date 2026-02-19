const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Level = require('../models/Level');
const Course = require('../models/Course');

dotenv.config();

const levels = [
  // Kids Levels 1-12
  { name: 'Kids Level 1', category: 'kids', order: 1 },
  { name: 'Kids Level 2', category: 'kids', order: 2 },
  { name: 'Kids Level 3', category: 'kids', order: 3 },
  { name: 'Kids Level 4', category: 'kids', order: 4 },
  { name: 'Kids Level 5', category: 'kids', order: 5 },
  { name: 'Kids Level 6', category: 'kids', order: 6 },
  { name: 'Kids Level 7', category: 'kids', order: 7 },
  { name: 'Kids Level 8', category: 'kids', order: 8 },
  { name: 'Kids Level 9', category: 'kids', order: 9 },
  { name: 'Kids Level 10', category: 'kids', order: 10 },
  { name: 'Kids Level 11', category: 'kids', order: 11 },
  { name: 'Kids Level 12', category: 'kids', order: 12 },
  // Teens Levels 1-14
  { name: 'Teens Level 1', category: 'teens', order: 1 },
  { name: 'Teens Level 2', category: 'teens', order: 2 },
  { name: 'Teens Level 3', category: 'teens', order: 3 },
  { name: 'Teens Level 4', category: 'teens', order: 4 },
  { name: 'Teens Level 5', category: 'teens', order: 5 },
  { name: 'Teens Level 6', category: 'teens', order: 6 },
  { name: 'Teens Level 7', category: 'teens', order: 7 },
  { name: 'Teens Level 8', category: 'teens', order: 8 },
  { name: 'Teens Level 9', category: 'teens', order: 9 },
  { name: 'Teens Level 10', category: 'teens', order: 10 },
  { name: 'Teens Level 11', category: 'teens', order: 11 },
  { name: 'Teens Level 12', category: 'teens', order: 12 },
  { name: 'Teens Level 13', category: 'teens', order: 13 },
  { name: 'Teens Level 14', category: 'teens', order: 14 },
  // Conversation Course
  { name: 'Conversation Course', category: 'conversation', order: 1 },
  // Kids 4-6
  { name: 'Kids 4-6', category: 'kids4-6', order: 1 }
];

const users = [
  // Admin
  {
    email: 'admin@epamp.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    phone: '555-0100',
    isActive: true,
    paymentStatus: 'paid'
  },
  // Teachers
  {
    email: 'teacher1@epamp.com',
    password: 'teacher123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'teacher',
    phone: '555-0101',
    subjects: ['Kids', 'Teens'],
    isActive: true,
    paymentStatus: 'paid'
  },
  {
    email: 'teacher2@epamp.com',
    password: 'teacher123',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'teacher',
    phone: '555-0102',
    subjects: ['Conversation', 'Kids 4-6'],
    isActive: true,
    paymentStatus: 'paid'
  },
  // Student
  {
    email: 'student@epamp.com',
    password: 'student123',
    firstName: 'Alex',
    lastName: 'Johnson',
    role: 'student',
    phone: '555-0103',
    isActive: true,
    paymentStatus: 'paid'
  },
  // Parent
  {
    email: 'parent@epamp.com',
    password: 'parent123',
    firstName: 'Robert',
    lastName: 'Johnson',
    role: 'parent',
    phone: '555-0104',
    isActive: true,
    paymentStatus: 'paid'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/epamp');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Level.deleteMany({});
    await Course.deleteMany({});
    console.log('Cleared existing data');

    // Insert levels
    const createdLevels = await Level.insertMany(levels);
    console.log(`Inserted ${createdLevels.length} levels`);

// Hash passwords
for (let user of users) {
  user.password = await bcrypt.hash(user.password, 10);
}
    // Create users with level references
    const kidsLevel1 = createdLevels.find(l => l.name === 'Kids Level 1');
    const kidsLevel2 = createdLevels.find(l => l.name === 'Kids Level 2');

    const usersWithLevels = [
      // Admin
      { ...users[0] },
      // Teachers
      { ...users[1] },
      { ...users[2] },
      // Student with level
      { 
        ...users[3],
        level: kidsLevel1._id
      },
      // Parent with child reference
      {
        ...users[4],
        children: [] // Will update after creating student
      }
    ];

    const createdUsers = await User.insertMany(usersWithLevels);
    console.log(`Inserted ${createdUsers.length} users`);

    // Update parent with child reference
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      children: [createdUsers[3]._id]
    });

    // Update student with parent reference
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      parent: createdUsers[4]._id
    });

    console.log('Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@epamp.com / admin123');
    console.log('Teacher: teacher1@epamp.com / teacher123');
    console.log('Student: student@epamp.com / student123');
    console.log('Parent: parent@epamp.com / parent123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
