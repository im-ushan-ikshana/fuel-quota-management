import 'package:mobile/data/models/auth/login_request.dart';
import 'package:mobile/data/models/auth/login_response.dart';
import 'package:mobile/data/models/auth/refresh_token_request.dart';
import 'package:mobile/data/models/fuel/fuel_quota_response.dart';
import 'package:mobile/data/models/fuel/pump_fuel_request.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/models/vehicle.dart';
import 'package:mobile/data/services/auth_service.dart';
// Import the service interface only, not the implementation with duplicate classes
import 'package:mobile/data/services/fuel_service.dart' show FuelService;

/// Mock implementation of AuthService for testing without a backend
class MockAuthService implements AuthService {
  // Demo users for testing
  final Map<String, User> _users = {
    'station001': User(
      id: '1',
      username: 'station001',
      fullName: 'John Doe',
      stationName: 'City Fuel Station',
      stationId: 'FS001',
      role: 'STATION_OPERATOR',
    ),
    'station002': User(
      id: '2',
      username: 'station002',
      fullName: 'Jane Smith',
      stationName: 'Highway Fuel Station',
      stationId: 'FS002',
      role: 'STATION_OPERATOR',
    ),
    'station003': User(
      id: '3',
      username: 'station003',
      fullName: 'Mike Johnson',
      stationName: 'Rural Fuel Station',
      stationId: 'FS003',
      role: 'STATION_OPERATOR',
    ),
  };

  // Store active refresh tokens
  final Map<String, String> _refreshTokens = {};

  @override
  Future<LoginResponse> login(LoginRequest request) async {
    // Add delay to simulate network call
    await Future.delayed(const Duration(seconds: 1));

    // Check credentials
    if (_users.containsKey(request.username) && request.password == 'password123') {
      final user = _users[request.username]!;
      
      // Generate mock tokens
      final token = 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      final refreshToken = 'mock_refresh_${DateTime.now().millisecondsSinceEpoch}';
      
      // Store refresh token for later use
      _refreshTokens[refreshToken] = request.username;
      
      return LoginResponse(
        token: token,
        refreshToken: refreshToken,
        user: user,
        expiresIn: 3600, // 1 hour expiry
      );
    } else {
      throw Exception('Invalid username or password');
    }
  }

  @override
  Future<LoginResponse> refreshToken(RefreshTokenRequest request) async {
    // Add delay to simulate network call
    await Future.delayed(const Duration(seconds: 1));

    final username = _refreshTokens[request.refreshToken];
    if (username != null && _users.containsKey(username)) {
      final user = _users[username]!;
      
      // Generate new mock tokens
      final token = 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      final refreshToken = 'mock_refresh_${DateTime.now().millisecondsSinceEpoch}';
      
      // Remove old token and store new one
      _refreshTokens.remove(request.refreshToken);
      _refreshTokens[refreshToken] = username;
      
      return LoginResponse(
        token: token,
        refreshToken: refreshToken,
        user: user,
        expiresIn: 3600, // 1 hour expiry
      );
    } else {
      throw Exception('Invalid refresh token');
    }
  }
}

/// Mock implementation of FuelService for testing without a backend
class MockFuelService implements FuelService {
  // Demo vehicles with their quotas
  final Map<String, Vehicle> _vehicles = {
    '12345': Vehicle(
      id: '1',
      registrationNumber: 'ABC-1234',
      vehicleType: 'Car',
      ownerName: 'James Smith',
      totalQuota: 40.0,
      usedQuota: 12.5,
      availableQuota: 27.5,
    ),
    '56782': Vehicle(
      id: '2',
      registrationNumber: 'XYZ-5678',
      vehicleType: 'Van',
      ownerName: 'Sarah Johnson',
      totalQuota: 60.0,
      usedQuota: 35.0,
      availableQuota: 25.0,
    ),
    '90123': Vehicle(
      id: '3',
      registrationNumber: 'DEF-9012',
      vehicleType: 'Motorcycle',
      ownerName: 'Michael Brown',
      totalQuota: 20.0,
      usedQuota: 5.0,
      availableQuota: 15.0,
    ),
  };

  // Track fuel transactions
  final List<PumpFuelRequest> _transactions = [];

  @override
  Future<FuelQuotaResponse> checkQuota(String qrCode) async {
    // Add delay to simulate network call
    await Future.delayed(const Duration(seconds: 1));

    // Check if vehicle exists
    if (_vehicles.containsKey(qrCode)) {
      final vehicle = _vehicles[qrCode]!;
      
      return FuelQuotaResponse(
        registrationNo: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        allocatedLitres: vehicle.totalQuota,
        usedLitres: vehicle.usedQuota,
        remainingLitres: vehicle.availableQuota,
        quotaPeriod: 'May 2025',
        ownerName: vehicle.ownerName,
      );
    } else {
      throw Exception('Vehicle not found with QR code: $qrCode');
    }
  }

  @override
  Future<void> pumpFuel(PumpFuelRequest request) async {
    // Add delay to simulate network call
    await Future.delayed(const Duration(seconds: 2));

    // Check if vehicle exists
    if (_vehicles.containsKey(request.qrCode)) {
      final vehicle = _vehicles[request.qrCode]!;
      
      // Check if there's enough quota
      if (vehicle.availableQuota < request.pumpedLitres) {
        throw Exception('Not enough fuel quota available');
      }
      
      // Update vehicle quota
      final updatedUsedQuota = vehicle.usedQuota + request.pumpedLitres;
      final updatedAvailableQuota = vehicle.totalQuota - updatedUsedQuota;
      
      _vehicles[request.qrCode] = Vehicle(
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        ownerName: vehicle.ownerName,
        totalQuota: vehicle.totalQuota,
        usedQuota: updatedUsedQuota,
        availableQuota: updatedAvailableQuota,
      );
      
      // Record transaction
      _transactions.add(request);
    } else {
      throw Exception('Vehicle not found with QR code: ${request.qrCode}');
    }
  }
}