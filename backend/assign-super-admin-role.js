const { PrismaClient } = require('@prisma/client');

async function assignSuperAdminRole() {
  const prisma = new PrismaClient();
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@example.com' }
    });
    
    // Find the Super Admin role
    const role = await prisma.role.findUnique({
      where: { name: 'Super Admin' }
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
        
        console.log('Super Admin role assigned successfully!');
        console.log(`User: ${user.email}`);
        console.log(`Role: ${role.name}`);
      } else {
        console.log('Super Admin role already assigned!');
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

assignSuperAdminRole();
