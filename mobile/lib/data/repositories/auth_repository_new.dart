import 'package:flutter/foundation.dart';
import '../models/user.dart';
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
    
    try {
      final response = await _authApiService.login(
        email: email,
        password: password,
      );
      
      if (response.success && response.data != null) {
        _currentUser = response.data!.operator;
        _isLoggedIn = true;
        notifyListeners();
        return true;
      } else {
        _error = response.message;
        _isLoggedIn = false;
        _currentUser = null;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = _handleError(e);
      _isLoggedIn = false;
      _currentUser = null;
      notifyListeners();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Logout current operator
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await _authApiService.logout();
    } catch (e) {
      // Continue with logout even if API call fails
      debugPrint('Logout API call failed: $e');
    } finally {
      _isLoggedIn = false;
      _currentUser = null;
      _error = null;
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Refresh operator profile
  Future<void> refreshProfile() async {
    if (!_isLoggedIn) return;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _authApiService.getOperatorProfile();
      
      if (response.success && response.data != null) {
        _currentUser = response.data;
        notifyListeners();
      } else {
        _error = response.message;
        notifyListeners();
      }
    } catch (e) {
      _error = _handleError(e);
      
      // If authentication error, logout user
      if (e is AuthException) {
        await logout();
      } else {
        notifyListeners();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Check and refresh authentication status
  Future<void> checkAuthStatus() async {
    try {
      final isValid = await _authApiService.isLoggedIn();
      
      if (!isValid && _isLoggedIn) {
        // Token expired, logout user
        await logout();
      } else if (isValid && !_isLoggedIn) {
        // User is authenticated but local state is wrong
        _isLoggedIn = true;
        _currentUser = await _authApiService.getCurrentUser();
        notifyListeners();
      }
    } catch (e) {
      if (_isLoggedIn) {
        await logout();
      }
    }
  }

  /// Clear current error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Get operator's station information
  String? get stationName => _currentUser?.stationName;
  String? get stationCode => _currentUser?.stationCode;
  String? get operatorName => _currentUser != null 
      ? '${_currentUser!.firstName} ${_currentUser!.lastName}'
      : null;

  /// Handle different types of errors
  String _handleError(dynamic error) {
    if (error is AuthException) {
      return 'Authentication failed. Please check your credentials.';
    } else if (error is NetworkException) {
      return 'Network error. Please check your internet connection.';
    } else if (error is ApiException) {
      return error.message;
    } else {
      return 'An unexpected error occurred: ${error.toString()}';
    }
  }
}
