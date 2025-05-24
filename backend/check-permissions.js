const { PrismaClient } = require('@prisma/client');

async function checkUserPermissions() {
  console.log('Starting permission check...');
  const prisma = new PrismaClient();
  
  try {
    console.log('Prisma client initialized successfully');    // Find the super admin user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@example.com' },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (user) {
      console.log('=== USER INFORMATION ===');
      console.log(`User ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`User Type: ${user.userType}`);
      console.log(`Is Active: ${user.isActive}`);
      
      console.log('\n=== USER ROLES ===');
      if (user.userRoles.length > 0) {        user.userRoles.forEach(userRole => {
          console.log(`Role: ${userRole.role.name}`);
          console.log(`Role ID: ${userRole.role.id}`);
          console.log(`Permissions count: ${userRole.role.permissions.length}`);
          
          if (userRole.role.permissions.length > 0) {
            console.log('Permissions:');
            userRole.role.permissions.forEach(rp => {
              console.log(`  - ${rp.permission.module}.${rp.permission.action}`);
            });
          }
        });
      } else {
        console.log('No roles assigned to user!');
      }
      
      // Check if Super Admin role exists
      console.log('\n=== CHECKING SUPER ADMIN ROLE ===');      const superAdminRole = await prisma.role.findUnique({
        where: { name: 'Super Admin' },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });
      
      if (superAdminRole) {
        console.log(`Super Admin role found with ${superAdminRole.permissions.length} permissions`);
          // Try to assign the role if not already assigned
        const existingAssignment = await prisma.userRole_Assignment.findUnique({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: superAdminRole.id
            }
          }
        });
        
        if (!existingAssignment) {
          console.log('Assigning Super Admin role to user...');
          await prisma.userRole_Assignment.create({
            data: {
              userId: user.id,
              roleId: superAdminRole.id
            }
          });
          console.log('Super Admin role assigned successfully!');
        } else {
          console.log('Super Admin role already assigned');
        }
      } else {
        console.log('Super Admin role not found!');
      }
      
    } else {
      console.log('User not found!');
    }  } catch (error) {
    console.error('Error in checkUserPermissions:', error.message);
    console.error('Full error:', error);
  } finally {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
    console.log('Permission check completed.');
  }
}

console.log('Script starting...');
checkUserPermissions().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
