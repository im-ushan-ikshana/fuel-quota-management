import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/config/api_config.dart';
import '../../core/models/api_response.dart';
import '../../core/services/token_service.dart';
import '../models/auth/login_response.dart';
import '../models/user.dart';

class AuthApiService {
  static AuthApiService? _instance;
  static AuthApiService get instance => _instance ??= AuthApiService._internal();
  
  AuthApiService._internal();

  final TokenService _tokenService = TokenService.instance;

  /// Operator login endpoint
  Future<ApiResponse<LoginResponse>> login({
    required String email,
    required String password,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.operatorLogin}');
      
      final body = jsonEncode({
        'email': email,
        'password': password,
      });

      final response = await http.post(
        url,
        headers: ApiConfig.defaultHeaders,
        body: body,
      ).timeout(ApiConfig.timeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        final loginResponse = LoginResponse.fromBackendJson(responseData['data']);
        
        // Store token and user data
        await _tokenService.storeToken(
          loginResponse.accessToken,
          loginResponse.expiresIn,
          loginResponse.operator.toJson(),
        );

        return ApiResponse.success(
          message: responseData['message'] ?? 'Login successful',
          data: loginResponse,
        );
      } else {
        return ApiResponse.error(
          message: responseData['message'] ?? 'Login failed',
          error: responseData['error'],
        );
      }
    } catch (e) {
      if (e.toString().contains('TimeoutException')) {
        throw NetworkException('Request timeout. Please check your internet connection.');
      }
      
      throw ApiException('Login failed: ${e.toString()}');
    }
  }

  /// Get current operator profile
  Future<ApiResponse<User>> getOperatorProfile() async {
    try {
      final authHeaders = await _tokenService.getAuthHeaders();
      if (authHeaders == null) {
        throw AuthException('No authentication token found');
      }

      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.operatorProfile}');
      
      final response = await http.get(
        url,
        headers: {
          ...ApiConfig.defaultHeaders,
          ...authHeaders,
        },
      ).timeout(ApiConfig.timeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        final user = User.fromOperatorResponse(responseData['data']);
        
        return ApiResponse.success(
          message: responseData['message'] ?? 'Profile retrieved successfully',
          data: user,
        );
      } else if (response.statusCode == 401) {
        // Token expired or invalid
        await _tokenService.clearToken();
        throw AuthException('Authentication expired. Please login again.');
      } else {
        return ApiResponse.error(
          message: responseData['message'] ?? 'Failed to retrieve profile',
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
      
      throw ApiException('Failed to get operator profile: ${e.toString()}');
    }
  }

  /// Logout operator
  Future<ApiResponse<void>> logout() async {
    try {
      // Clear local token data
      await _tokenService.clearToken();
      
      return ApiResponse.success(
        message: 'Logged out successfully',
      );
    } catch (e) {
      throw ApiException('Logout failed: ${e.toString()}');
    }
  }

  /// Check if operator is logged in
  Future<bool> isLoggedIn() async {
    return await _tokenService.isLoggedIn();
  }

  /// Get stored user data
  Future<User?> getCurrentUser() async {
    try {
      final userData = await _tokenService.getUserData();
      if (userData != null) {
        return User.fromOperatorResponse(userData);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Refresh token (if backend supports it)
  Future<ApiResponse<LoginResponse>> refreshToken() async {
    // Note: This would require backend implementation of refresh token endpoint
    // For now, we'll just check if current token is valid
    try {
      final isValid = await _tokenService.isLoggedIn();
      if (!isValid) {
        await _tokenService.clearToken();
        throw AuthException('Token expired. Please login again.');
      }
      
      // If we had a refresh endpoint, we would call it here
      // For now, return success if token is still valid
      return ApiResponse.success(
        message: 'Token is still valid',
      );
    } catch (e) {
      throw AuthException('Token refresh failed: ${e.toString()}');
    }
  }
}