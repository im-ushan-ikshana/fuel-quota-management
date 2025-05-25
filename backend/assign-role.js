const { PrismaClient } = require('@prisma/client');

async function assignRole() {
  const prisma = new PrismaClient();
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'testuser@example.com' }
    });
    
    // Find the Vehicle Owner role
    const role = await prisma.role.findUnique({
      where: { name: 'Vehicle Owner' }
    });
    
    if (user && role) {
      // Check if assignment already exists
      const existing = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id
          }
        }
      });
      
      if (!existing) {
        // Assign role to user
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: role.id
          }
        });
        
        console.log('Role assigned successfully!');
        console.log(`User: ${user.email}`);
        console.log(`Role: ${role.name}`);
      } else {
        console.log('Role already assigned!');
      }
    } else {
      console.log('User or role not found');
      console.log('User found:', !!user);
      console.log('Role found:', !!role);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignRole();
