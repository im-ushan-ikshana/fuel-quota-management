import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mobile/data/models/user.dart';

class TokenStorage {
  static const String KEY_ACCESS_TOKEN = 'access_token';
  static const String KEY_REFRESH_TOKEN = 'refresh_token';
  static const String KEY_USER = 'user_data';
  static const String KEY_EXPIRY = 'token_expiry';

  final FlutterSecureStorage _secureStorage;

  TokenStorage({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  // Save auth data after login
  Future<void> saveAuthData({
    required String token,
    required String refreshToken,
    required User user,
    required int expiresIn,
  }) async {
    final expiryTime = DateTime.now()
        .add(Duration(seconds: expiresIn))
        .millisecondsSinceEpoch;

    await _secureStorage.write(key: KEY_ACCESS_TOKEN, value: token);
    await _secureStorage.write(key: KEY_REFRESH_TOKEN, value: refreshToken);
    await _secureStorage.write(
        key: KEY_USER, value: jsonEncode(user.toJson()));
    await _secureStorage.write(key: KEY_EXPIRY, value: expiryTime.toString());
  }

  // Get access token
  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: KEY_ACCESS_TOKEN);
  }

  // Get refresh token
  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: KEY_REFRESH_TOKEN);
  }

  // Get stored user
  Future<User?> getUser() async {
    final userJson = await _secureStorage.read(key: KEY_USER);
    if (userJson == null) return null;
    
    try {
      return User.fromJson(jsonDecode(userJson));
    } catch (e) {
      return null;
    }
  }

  // Check if token is expired
  Future<bool> isTokenExpired() async {
    final expiryString = await _secureStorage.read(key: KEY_EXPIRY);
    if (expiryString == null) return true;
    
    final expiry = int.parse(expiryString);
    final now = DateTime.now().millisecondsSinceEpoch;
    
    return now >= expiry;
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null;
  }

  // Clear all authentication data (logout)
  Future<void> clearAuthData() async {
    await _secureStorage.delete(key: KEY_ACCESS_TOKEN);
    await _secureStorage.delete(key: KEY_REFRESH_TOKEN);
    await _secureStorage.delete(key: KEY_USER);
    await _secureStorage.delete(key: KEY_EXPIRY);
  }
}
