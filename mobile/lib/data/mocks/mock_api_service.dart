import 'package:mobile/data/interfaces/auth_service_interface.dart';
import 'package:mobile/data/interfaces/fuel_service_interface.dart';
import 'package:mobile/data/models/auth/login_request.dart';
import 'package:mobile/data/models/auth/login_response.dart';
import 'package:mobile/data/models/auth/refresh_token_request.dart';
import 'package:mobile/data/models/fuel/fuel_quota_response.dart';
import 'package:mobile/data/models/fuel/pump_fuel_request.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/models/vehicle.dart';

/// Mock implementation of AuthServiceInterface for testing without a backend
class MockAuthService implements AuthServiceInterface {
  // Demo users for testing
  final Map<String, User> _users = {
    'station001@fuel.com': User(
      id: '1',
      email: 'station001@fuel.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+94771234567',
      employeeId: 'EMP001',
      stationId: 'station-1',
      stationCode: 'FS001',
      stationName: 'City Fuel Station',
      role: 'FUEL_STATION_OPERATOR',
    ),
    'station002@fuel.com': User(
      id: '2',
      email: 'station002@fuel.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+94771234568',
      employeeId: 'EMP002',
      stationId: 'station-2',
      stationCode: 'FS002',
      stationName: 'Highway Fuel Station',
      role: 'FUEL_STATION_OPERATOR',
    ),
    'station003@fuel.com': User(
      id: '3',
      email: 'station003@fuel.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phoneNumber: '+94771234569',
      employeeId: 'EMP003',
      stationId: 'station-3',
      stationCode: 'FS003',
      stationName: 'Rural Fuel Station',
      role: 'FUEL_STATION_OPERATOR',
    ),
  };
  // Store active refresh tokens
  final Map<String, String> _refreshTokens = {};

  @override
  Future<LoginResponse> login(LoginRequest request) async {
    // Add delay to simulate network call
    await Future.delayed(const Duration(seconds: 1));
    
    // Check credentials
    if (_users.containsKey(request.email) && request.password == 'password123') {
      final user = _users[request.email]!;
      
      // Generate mock tokens
      final token = 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      final refreshToken = 'mock_refresh_${DateTime.now().millisecondsSinceEpoch}';
      
      // Store refresh token for later use
      _refreshTokens[refreshToken] = request.email;
      
      return LoginResponse(
        accessToken: token,
        refreshToken: refreshToken,
        user: user,
        expiresIn: '3600', // 1 hour expiry as string
      );    } else {
      throw Exception('Invalid username or password');
    }
  }

  @override
  Future<LoginResponse> refreshToken(RefreshTokenRequest request) async {
    // Add delay to simulate network call
    await Future.delayed(const Duration(seconds: 1));
    
    final email = _refreshTokens[request.refreshToken];    if (email != null && _users.containsKey(email)) {
      final user = _users[email]!;
      
      // Generate new mock tokens
      final token = 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      final refreshToken = 'mock_refresh_${DateTime.now().millisecondsSinceEpoch}';
      
      // Remove old token and store new one
      _refreshTokens.remove(request.refreshToken);
      _refreshTokens[refreshToken] = email;
      
      return LoginResponse(
        accessToken: token,
        refreshToken: refreshToken,
        user: user,
        expiresIn: '3600', // 1 hour expiry as string
      );
    } else {
      throw Exception('Invalid refresh token');
    }
  }
}

/// Mock implementation of FuelServiceInterface for testing without a backend
class MockFuelService implements FuelServiceInterface {
  // Demo vehicles with their quotas
  final Map<String, Vehicle> _vehicles = {
    '12345': Vehicle(
      id: '1',
      registrationNumber: 'ABC-1234',
      vehicleType: 'Car',
      fuelType: 'PETROL_92_OCTANE',
      ownerName: 'James Smith',
      quota: QuotaInfo(
        allocatedQuota: 40.0,
        usedQuota: 12.5,
        remainingQuota: 27.5,
        quotaPercentage: 31.25,
      ),
    ),
    '56782': Vehicle(
      id: '2',
      registrationNumber: 'XYZ-5678',
      vehicleType: 'Van',
      fuelType: 'AUTO_DIESEL',
      ownerName: 'Sarah Johnson',
      quota: QuotaInfo(
        allocatedQuota: 60.0,
        usedQuota: 35.0,
        remainingQuota: 25.0,
        quotaPercentage: 58.33,
      ),
    ),
    '90123': Vehicle(
      id: '3',
      registrationNumber: 'DEF-9012',
      vehicleType: 'Motorcycle',
      fuelType: 'PETROL_92_OCTANE',
      ownerName: 'Michael Brown',
      quota: QuotaInfo(
        allocatedQuota: 20.0,
        usedQuota: 5.0,
        remainingQuota: 15.0,
        quotaPercentage: 25.0,
      ),
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
      final updatedQuotaPercentage = (updatedUsedQuota / vehicle.totalQuota) * 100;
      
      _vehicles[request.qrCode] = Vehicle(
        id: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        fuelType: vehicle.fuelType,
        ownerName: vehicle.ownerName,
        quota: QuotaInfo(
          allocatedQuota: vehicle.totalQuota,
          usedQuota: updatedUsedQuota,
          remainingQuota: updatedAvailableQuota,
          quotaPercentage: updatedQuotaPercentage,
        ),
      );
      
      // Record transaction
      _transactions.add(request);
    } else {
      throw Exception('Vehicle not found with QR code: ${request.qrCode}');
    }
  }
}