import 'package:flutter/foundation.dart';
import 'package:mobile/core/utils/local_storage.dart';
import 'package:mobile/data/models/auth/login_request.dart';
import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/data/services/token_manager.dart';

/// Repository that handles authentication operations
class AuthRepository extends ChangeNotifier {
  final AuthService _authService;
  final TokenManager _tokenManager;
  
  User? _currentUser;
  bool _isLoading = false;
  String? _error;
  
  // Getters
  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _currentUser != null;
  
  AuthRepository({
    required AuthService authService,
    required TokenManager tokenManager,
  })  : _authService = authService,
        _tokenManager = tokenManager {
    // Check if user is already logged in on initialization
    _initializeUser();
  }
  
  /// Initialize user from stored token
  Future<void> _initializeUser() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final user = await _tokenManager.getUser();
      if (user != null) {
        _currentUser = user;
      }
    } catch (e) {
      _error = e.toString();
      await _tokenManager.clearAuthData();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Log in a user with username and password
  Future<bool> login(String username, String password, {bool rememberMe = false}) async {
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