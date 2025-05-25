import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class TokenService {
  static const String _tokenKey = 'access_token';
  static const String _tokenExpiryKey = 'token_expiry';
  static const String _userDataKey = 'user_data';

  static TokenService? _instance;
  static TokenService get instance => _instance ??= TokenService._internal();
  
  TokenService._internal();

  String? _accessToken;
  DateTime? _tokenExpiry;
  Map<String, dynamic>? _userData;

  /// Store access token securely
  Future<void> storeToken(String token, String expiresIn, Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Calculate expiry time from expiresIn string (e.g., "2h", "24h")
    final expiry = _parseExpiryTime(expiresIn);
    
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_tokenExpiryKey, expiry.toIso8601String());
    await prefs.setString(_userDataKey, jsonEncode(userData));
    
    _accessToken = token;
    _tokenExpiry = expiry;
    _userData = userData;
  }

  /// Get stored access token
  Future<String?> getToken() async {
    if (_accessToken != null && !isTokenExpired()) {
      return _accessToken;
    }

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final expiryStr = prefs.getString(_tokenExpiryKey);
    
    if (token != null && expiryStr != null) {
      _accessToken = token;
      _tokenExpiry = DateTime.parse(expiryStr);
      
      if (!isTokenExpired()) {
        return token;
      } else {
        // Token expired, clear it
        await clearToken();
      }
    }
    
    return null;
  }

  /// Get stored user data
  Future<Map<String, dynamic>?> getUserData() async {
    if (_userData != null) {
      return _userData;
    }

    final prefs = await SharedPreferences.getInstance();
    final userDataStr = prefs.getString(_userDataKey);
    
    if (userDataStr != null) {
      _userData = jsonDecode(userDataStr);
      return _userData;
    }
    
    return null;
  }

  /// Check if token is expired
  bool isTokenExpired() {
    if (_tokenExpiry == null) return true;
    return DateTime.now().isAfter(_tokenExpiry!);
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && !isTokenExpired();
  }

  /// Clear all stored token data
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_tokenExpiryKey);
    await prefs.remove(_userDataKey);
    
    _accessToken = null;
    _tokenExpiry = null;
    _userData = null;
  }

  /// Parse expiry time from backend format (e.g., "2h", "24h", "30m")
  DateTime _parseExpiryTime(String expiresIn) {
    final now = DateTime.now();
    
    if (expiresIn.endsWith('h')) {
      final hours = int.parse(expiresIn.substring(0, expiresIn.length - 1));
      return now.add(Duration(hours: hours));
    } else if (expiresIn.endsWith('m')) {
      final minutes = int.parse(expiresIn.substring(0, expiresIn.length - 1));
      return now.add(Duration(minutes: minutes));
    } else if (expiresIn.endsWith('d')) {
      final days = int.parse(expiresIn.substring(0, expiresIn.length - 1));
      return now.add(Duration(days: days));
    }
    
    // Default to 2 hours if parsing fails
    return now.add(const Duration(hours: 2));
  }

  /// Get authorization header for API requests
  Future<Map<String, String>?> getAuthHeaders() async {
    final token = await getToken();
    if (token != null) {
      return {
        'Authorization': 'Bearer $token',
      };
    }
    return null;
  }
}
