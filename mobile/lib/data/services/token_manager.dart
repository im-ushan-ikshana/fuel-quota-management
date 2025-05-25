import 'package:mobile/data/models/auth/refresh_token_request.dart';
import 'package:mobile/data/models/auth/auth_response.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/data/services/token_storage.dart';

/// Manages JWT token operations including storing, retrieving, and refreshing tokens
class TokenManager {
  final TokenStorage _tokenStorage;
  final AuthService _authService;

  TokenManager({
    required TokenStorage tokenStorage,
    required AuthService authService,
  })  : _tokenStorage = tokenStorage,
        _authService = authService;
  /// Save authentication data after successful login
  Future<void> saveAuthData(AuthResponse response) async {
    await _tokenStorage.saveAuthData(
      token: response.token,
      refreshToken: response.refreshToken,
      user: response.user,
      expiresIn: response.expiresIn,
    );
  }

  /// Get the access token, refreshing if necessary
  Future<String?> getAccessToken() async {
    if (await _tokenStorage.isTokenExpired()) {
      return _refreshToken();
    }
    return _tokenStorage.getAccessToken();
  }

  /// Get the currently logged in user
  Future<User?> getUser() async {
    return _tokenStorage.getUser();
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    return _tokenStorage.isLoggedIn();
  }

  /// Clear auth data on logout
  Future<void> clearAuthData() async {
    await _tokenStorage.clearAuthData();
  }

  /// Refresh the token when it's expired
  Future<String?> _refreshToken() async {
    final refreshToken = await _tokenStorage.getRefreshToken();
    
    if (refreshToken == null) {
      return null;
    }
    
    try {      final refreshRequest = RefreshTokenRequest(refreshToken: refreshToken);
      final response = await _authService.refreshToken(refreshRequest);
      
      // Convert LoginResponse to AuthResponse before saving
      final authResponse = response.toAuthResponse();
      await saveAuthData(authResponse);
      return response.token;
    } catch (e) {
      // If refresh fails, clear auth data and return null
      await clearAuthData();
      return null;
    }
  }
}