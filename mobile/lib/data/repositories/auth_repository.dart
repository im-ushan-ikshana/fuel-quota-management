import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../models/auth/login_response.dart';
import '../api/auth_api_service.dart';
import '../../core/models/api_response.dart';

/// Repository that handles authentication operations
class AuthRepository extends ChangeNotifier {
  final AuthApiService _authApiService;
  
  bool _isLoading = false;
  String? _error;
  User? _currentUser;
  bool _isLoggedIn = false;
  
  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  User? get currentUser => _currentUser;
  bool get isLoggedIn => _isLoggedIn;  
  AuthRepository({
    AuthApiService? authApiService,
  }) : _authApiService = authApiService ?? AuthApiService.instance;

  /// Initialize authentication state on app start
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      _isLoggedIn = await _authApiService.isLoggedIn();
      
      if (_isLoggedIn) {
        _currentUser = await _authApiService.getCurrentUser();
      }
    } catch (e) {
      _isLoggedIn = false;
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Login operator with email and password
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {      final loginRequest = LoginRequest(username: username, password: password);
      final response = await _authService.login(loginRequest);
      
      // Convert LoginResponse to AuthResponse before saving
      final authResponse = response.toAuthResponse();
      await _tokenManager.saveAuthData(authResponse);
      _currentUser = response.user;
      
      // Store rememberMe preference
      if (rememberMe) {
        await LocalStorage.saveString('saved_username', username);
        await LocalStorage.saveBool('remember_me', true);
      } else {
        await LocalStorage.remove('saved_username');
        await LocalStorage.saveBool('remember_me', false);
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Log out the current user
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await _tokenManager.clearAuthData();
      _currentUser = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Get the remember me status
  Future<bool> getRememberMe() async {
    return await LocalStorage.getBool('remember_me') ?? false;
  }
  
  /// Get the saved username if remember me is enabled
  Future<String?> getSavedUsername() async {
    if (await getRememberMe()) {
      return LocalStorage.getString('saved_username');
    }
    return null;
  }
  
  /// Clear the current error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}