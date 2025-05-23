import 'package:dio/dio.dart';
import 'package:mobile/data/models/auth/login_request.dart';
import 'package:mobile/data/models/auth/login_response.dart';
import 'package:mobile/data/models/auth/refresh_token_request.dart';

abstract class AuthService {
  Future<LoginResponse> login(LoginRequest request);
  Future<LoginResponse> refreshToken(RefreshTokenRequest request);
}

// Implementation using Dio without Retrofit for simplicity
class AuthServiceImpl implements AuthService {
  final Dio _dio;
  final String _baseUrl;

  AuthServiceImpl(this._dio, this._baseUrl);

  @override
  Future<LoginResponse> login(LoginRequest request) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/login',
        data: request.toJson(),
      );
      
      if (response.statusCode == 200) {
        return LoginResponse.fromJson(response.data);
      } else {
        throw DioException(
          requestOptions: RequestOptions(path: '/login'),
          error: 'Login failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is DioException) {
        throw DioException(
          requestOptions: e.requestOptions,
          error: 'Login failed: ${e.message}',
        );
      }
      throw Exception('Login failed: $e');
    }
  }

  @override
  Future<LoginResponse> refreshToken(RefreshTokenRequest request) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/refresh',
        data: request.toJson(),
      );
      
      if (response.statusCode == 200) {
        return LoginResponse.fromJson(response.data);
      } else {
        throw DioException(
          requestOptions: RequestOptions(path: '/refresh'),
          error: 'Token refresh failed with status: ${response.statusCode}',
        );
      }
    } catch (e) {
      if (e is DioException) {
        throw DioException(
          requestOptions: e.requestOptions,
          error: 'Token refresh failed: ${e.message}',
        );
      }
      throw Exception('Token refresh failed: $e');
    }
  }
}
