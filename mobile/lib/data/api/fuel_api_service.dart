import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/config/api_config.dart';
import '../../core/models/api_response.dart';
import '../../core/services/token_service.dart';
import '../models/vehicle.dart';
import '../models/transaction.dart';
import '../models/fuel/pump_fuel_request.dart';

class FuelApiService {
  static FuelApiService? _instance;
  static FuelApiService get instance => _instance ??= FuelApiService._internal();
  
  FuelApiService._internal();

  final TokenService _tokenService = TokenService.instance;

  /// Scan QR code to get vehicle quota information
  Future<ApiResponse<Vehicle>> scanQrCode(String qrCode) async {
    try {
      final authHeaders = await _tokenService.getAuthHeaders();
      if (authHeaders == null) {
        throw AuthException('No authentication token found');
      }

      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.scanQrCode}');
      
      final body = jsonEncode({
        'qrCode': qrCode,
      });

      final response = await http.post(
        url,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...authHeaders,
        },
        body: body,
      ).timeout(ApiConfig.timeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        final vehicle = Vehicle.fromQrScanResponse(responseData['data']);
        
        return ApiResponse.success(
          message: responseData['message'] ?? 'QR code scanned successfully',
          data: vehicle,
        );
      } else if (response.statusCode == 401) {
        await _tokenService.clearToken();
        throw AuthException('Authentication expired. Please login again.');
      } else {
        return ApiResponse.error(
          message: responseData['message'] ?? 'Failed to scan QR code',
          error: responseData['error'],
        );
      }
    } catch (e) {
      if (e is AuthException) {
        rethrow;
      }
      
      if (e.toString().contains('TimeoutException')) {
        throw NetworkException('Request timeout. Please check your internet connection.');
      }
      
      throw ApiException('QR scan failed: ${e.toString()}');
    }
  }

  /// Record fuel pumping transaction
  Future<ApiResponse<Transaction>> pumpFuel(PumpFuelRequest request) async {
    try {
      final authHeaders = await _tokenService.getAuthHeaders();
      if (authHeaders == null) {
        throw AuthException('No authentication token found');
      }

      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.pumpFuel}');
      
      // Convert PumpFuelRequest to backend expected format
      final body = jsonEncode({
        'qrCode': request.qrCode,
        'vehicleId': request.vehicleId,
        'fuelType': 'PETROL_92_OCTANE', // This should come from scanned vehicle data
        'quantityLiters': request.pumpedLitres,
        'fuelStationId': request.stationId,
      });

      final response = await http.post(
        url,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...authHeaders,
        },
        body: body,
      ).timeout(ApiConfig.timeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201 && responseData['success'] == true) {
        final transaction = Transaction.fromJson(responseData['data']['transaction']);
        
        return ApiResponse.success(
          message: responseData['message'] ?? 'Fuel pumping recorded successfully',
          data: transaction,
        );
      } else if (response.statusCode == 401) {
        await _tokenService.clearToken();
        throw AuthException('Authentication expired. Please login again.');
      } else {
        return ApiResponse.error(
          message: responseData['message'] ?? 'Failed to record fuel pumping',
          error: responseData['error'],
        );
      }
    } catch (e) {
      if (e is AuthException) {
        rethrow;
      }
      
      if (e.toString().contains('TimeoutException')) {
        throw NetworkException('Request timeout. Please check your internet connection.');
      }
      
      throw ApiException('Fuel pumping failed: ${e.toString()}');
    }
  }

  /// Get transaction details by ID
  Future<ApiResponse<Transaction>> getTransactionDetails(String transactionId) async {
    try {
      final authHeaders = await _tokenService.getAuthHeaders();
      if (authHeaders == null) {
        throw AuthException('No authentication token found');
      }

      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.getTransactionById.replaceAll(':transactionId', transactionId)}');
      
      final response = await http.get(
        url,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...authHeaders,
        },
      ).timeout(ApiConfig.timeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        final transaction = Transaction.fromJson(responseData['data']['transaction']);
        
        return ApiResponse.success(
          message: responseData['message'] ?? 'Transaction details retrieved successfully',
          data: transaction,
        );
      } else if (response.statusCode == 401) {
        await _tokenService.clearToken();
        throw AuthException('Authentication expired. Please login again.');
      } else if (response.statusCode == 404) {
        return ApiResponse.error(
          message: 'Transaction not found',
          error: 'NOT_FOUND',
        );
      } else {
        return ApiResponse.error(
          message: responseData['message'] ?? 'Failed to retrieve transaction details',
          error: responseData['error'],
        );
      }
    } catch (e) {
      if (e is AuthException) {
        rethrow;
      }
      
      if (e.toString().contains('TimeoutException')) {
        throw NetworkException('Request timeout. Please check your internet connection.');
      }
      
      throw ApiException('Failed to get transaction details: ${e.toString()}');
    }
  }

  /// Get recent transactions (for demo/testing purposes)
  Future<ApiResponse<List<Transaction>>> getRecentTransactions({int limit = 20}) async {
    try {
      final authHeaders = await _tokenService.getAuthHeaders();
      if (authHeaders == null) {
        throw AuthException('No authentication token found');
      }

      // Note: This endpoint might not exist in the backend yet
      // This is a placeholder for future implementation
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.listTransactions}?limit=$limit'); // Corrected to use listTransactions
      
      final response = await http.get(
        url,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...authHeaders,
        },
      ).timeout(ApiConfig.timeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        final List<dynamic> transactionsList = responseData['data']['transactions'] ?? [];
        final transactions = transactionsList.map((json) => Transaction.fromJson(json)).toList();
        
        return ApiResponse.success(
          message: responseData['message'] ?? 'Transactions retrieved successfully',
          data: transactions,
        );
      } else if (response.statusCode == 401) {
        await _tokenService.clearToken();
        throw AuthException('Authentication expired. Please login again.');
      } else {
        return ApiResponse.error(
          message: responseData['message'] ?? 'Failed to retrieve transactions',
          error: responseData['error'],
        );
      }
    } catch (e) {
      if (e is AuthException) {
        rethrow;
      }
      
      if (e.toString().contains('TimeoutException')) {
        throw NetworkException('Request timeout. Please check your internet connection.');
      }
      
      // For now, return demo data if endpoint doesn't exist
      // throw ApiException('Failed to get recent transactions: ${e.toString()}'); // Commented out demo data fallback
      rethrow; // Rethrow the original error to see what it is
    }
  }
}