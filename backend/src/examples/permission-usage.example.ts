// Example usage of permission middleware in routes
import { Router, Request, Response } from 'express';
import { 
  requirePermission, 
  requireAnyPermission, 
  requireRole,
  checkUserPermission,
  getUserPermissions,
  getUserRoles,
  AuthenticatedRequest
} from '../utils/permissions';

const router = Router();

// Example 1: Basic permission check - User must have 'user.read' permission
router.get('/admin/users', requirePermission('user', 'read'), async (req, res) => {
  try {
    // User has permission to read users
    res.json({ message: 'User list accessed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 2: Multiple permission routes - User must have specific permissions
router.post('/admin/users', requirePermission('user', 'create'), async (req, res) => {
  try {
    // User has permission to create users
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/admin/users/:id', requirePermission('user', 'update'), async (req, res) => {
  try {
    // User has permission to update users
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/admin/users/:id', requirePermission('user', 'delete'), async (req, res) => {
  try {
    // User has permission to delete users
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 3: Any permission check - User must have ANY of the specified permissions
router.get('/dashboard', requireAnyPermission([
  { module: 'dashboard', action: 'view' },
  { module: 'admin', action: 'access' },
  { module: 'fuel_station', action: 'manage' }
]), async (req, res) => {
  try {
    // User has at least one of the required permissions
    res.json({ message: 'Dashboard accessed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 4: Role-based access - User must have a specific role
router.get('/admin/system-settings', requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    // User has SUPER_ADMIN role
    res.json({ message: 'System settings accessed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 5: Fuel station management permissions
router.get('/fuel-stations', requirePermission('fuel_station', 'read'), async (req, res) => {
  try {
    res.json({ message: 'Fuel stations list' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/fuel-stations', requirePermission('fuel_station', 'create'), async (req, res) => {
  try {
    res.json({ message: 'Fuel station created' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 6: Vehicle management permissions
router.get('/vehicles', requirePermission('vehicle', 'read'), async (req, res) => {
  try {
    res.json({ message: 'Vehicle list' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/vehicles', requirePermission('vehicle', 'create'), async (req, res) => {
  try {
    res.json({ message: 'Vehicle registered' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 7: Fuel transaction permissions
router.post('/fuel-transactions', requirePermission('fuel_transaction', 'create'), async (req, res) => {
  try {
    res.json({ message: 'Fuel transaction recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/fuel-transactions', requireAnyPermission([
  { module: 'fuel_transaction', action: 'read' },
  { module: 'fuel_transaction', action: 'read_own' }
]), async (req, res) => {
  try {
    res.json({ message: 'Fuel transaction history' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 8: Programmatic permission check within route handler
router.post('/complex-operation', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check multiple permissions programmatically
    const canCreateUser = await checkUserPermission(userId, 'user', 'create');
    const canManageFuelStation = await checkUserPermission(userId, 'fuel_station', 'manage');
    
    if (!canCreateUser || !canManageFuelStation) {
      res.status(403).json({ 
        error: 'Insufficient permissions for this operation' 
      });
      return;
    }

    // Perform complex operation
    res.json({ message: 'Complex operation completed' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 9: Get user permissions for frontend
router.get('/auth/permissions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const permissions = await getUserPermissions(userId);
    const roles = await getUserRoles(userId);

    res.json({ 
      permissions, 
      roles,
      userId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example 10: Combined role and permission check
router.get('/admin/advanced-settings', 
  requireRole('ADMIN'),
  requirePermission('system', 'advanced_config'),
  async (req, res) => {
    try {
      // User must have ADMIN role AND system.advanced_config permission
      res.json({ message: 'Advanced settings accessed' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

/*
 * SUGGESTED PERMISSION STRUCTURE FOR FUEL QUOTA MANAGEMENT:
 * 
 * Modules and Actions:
 * 
 * 1. user: create, read, update, delete, manage_roles
 * 2. vehicle: create, read, update, delete, register, manage_quota
 * 3. fuel_station: create, read, update, delete, manage, operate
 * 4. fuel_transaction: create, read, update, delete, process, approve
 * 5. quota: manage, view, adjust, reset
 * 6. admin: access, manage_system, view_reports
 * 7. dashboard: view, manage
 * 8. reports: generate, view, export
 * 9. system: configure, maintain, backup
 * 10. audit: view, export
 * 
 * Example Permission Names:
 * - user.create
 * - user.read
 * - user.update
 * - user.delete
 * - vehicle.register
 * - vehicle.manage_quota
 * - fuel_station.operate
 * - fuel_transaction.process
 * - quota.adjust
 * - admin.manage_system
 * - reports.generate
 * - system.configure
 * - audit.view
 */
