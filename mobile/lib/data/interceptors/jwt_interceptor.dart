import 'package:dio/dio.dart';
import 'package:mobile/data/services/token_manager.dart';

/// Interceptor to handle JWT authentication for API requests
class JwtInterceptor extends Interceptor {
  final TokenManager _tokenManager;

  JwtInterceptor(this._tokenManager);

  @override
  Future<void> onRequest(
    RequestOptions options, 
    RequestInterceptorHandler handler,
  ) async {
    // Skip authentication for login and refresh endpoints
    if (options.path.contains('/login') || options.path.contains('/refresh')) {
      return handler.next(options);
    }

    final token = await _tokenManager.getAccessToken();
    
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    } else {
      // If we don't have a token, we can't authenticate the request
      // This might happen if token refresh fails or the user is not logged in
      options.headers.remove('Authorization');
    }

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Handle 401 Unauthorized errors - token expired or invalid
    if (err.response?.statusCode == 401) {
      // We could attempt to refresh the token here and retry the request
      // But this might cause infinite loops if the refresh also fails
      // Instead, we'll let the UI handle the 401 error and navigate to login if needed
    }
    
    return handler.next(err);
  }
}