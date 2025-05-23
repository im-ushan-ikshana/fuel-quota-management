import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/data/interceptors/jwt_interceptor.dart';
import 'package:mobile/data/mocks/mock_api_service.dart';
import 'package:mobile/data/repositories/auth_repository.dart';
import 'package:mobile/data/repositories/fuel_repository.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/data/services/fuel_service.dart';
import 'package:mobile/data/services/token_manager.dart';
import 'package:mobile/data/services/token_storage.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

/// Factory class for creating API clients and repositories
class ApiClientFactory {
  // Default API URL - would be changed for production
  static const String _baseApiUrl = 'https://fuel-quota.example.com/api';
  
  // Flag to use mock services instead of real ones for testing
  static bool useMockServices = true;

  /// Create a configured Dio instance with JWT interceptor
  static Dio createDio(TokenManager tokenManager) {
    final dio = Dio(
      BaseOptions(
        baseUrl: _baseApiUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        contentType: Headers.jsonContentType,
        responseType: ResponseType.json,
      ),
    );

    // Add JWT interceptor
    dio.interceptors.add(JwtInterceptor(tokenManager));
    
    // Add logging interceptor in debug mode
    if (kDebugMode) {
      dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseHeader: true,
          responseBody: true,
          error: true,
          compact: true,
        ),
      );
    }

    return dio;
  }

  /// Create AuthService instance (real or mock)
  static AuthService createAuthService(Dio? dio) {
    if (useMockServices) {
      return MockAuthService();
    } else {
      return AuthServiceImpl(dio ?? Dio(), '$_baseApiUrl/auth');
    }
  }

  /// Create FuelService instance (real or mock)
  static FuelService createFuelService(Dio? dio) {
    if (useMockServices) {
      return MockFuelService();
    } else {
      return FuelServiceImpl(dio ?? Dio(), '$_baseApiUrl/fuel');
    }
  }

  /// Create AuthRepository with all dependencies
  static AuthRepository createAuthRepository() {
    final tokenStorage = TokenStorage();
    final authService = createAuthService(null);
    final tokenManager = TokenManager(
      tokenStorage: tokenStorage,
      authService: authService,
    );
    final dio = createDio(tokenManager);
    
    // Create auth service with configured dio
    final configuredAuthService = useMockServices 
        ? authService 
        : createAuthService(dio);
    
    return AuthRepository(
      authService: configuredAuthService,
      tokenManager: tokenManager,
    );
  }

  /// Create FuelRepository with all dependencies
  static FuelRepository createFuelRepository(TokenManager tokenManager) {
    final dio = createDio(tokenManager);
    final fuelService = createFuelService(dio);
    
    return FuelRepository(fuelService: fuelService);
  }
}