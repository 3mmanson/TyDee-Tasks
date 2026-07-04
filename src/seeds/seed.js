const db = require('../models/database');

const seedTasks = [
  {
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the REST API project',
    status: 'in_progress'
  },
  {
    title: 'Review pull requests',
    description: 'Review and approve pending PRs from the team',
    status: 'pending'
  },
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'completed'
  },
  {
    title: 'Fix authentication bug',
    description: 'Resolve the token expiration issue in the login flow',
    status: 'pending'
  },
  {
    title: 'Database optimization',
    description: 'Add indexes and optimize queries for better performance',
    status: 'in_progress'
  }
];

async function seed() {
  try {
    // Clear existing data
    await db('tasks').del();

    // Insert seed data
    const now = new Date();
    const tasksWithTimestamps = seedTasks.map(task => ({
      ...task,
      created_at: now,
      updated_at: now
    }));

    await db('tasks').insert(tasksWithTimestamps);

    console.log('Database seeded successfully with 5 tasks!');
    console.log('\nSeeded tasks:');
    seedTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} [${task.status}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

seed();
