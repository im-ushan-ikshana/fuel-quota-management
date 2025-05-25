import 'package:mobile/data/models/auth/login_request.dart';
import 'package:mobile/data/models/auth/login_response.dart';
import 'package:mobile/data/models/auth/refresh_token_request.dart';

/// Interface for authentication services
abstract class AuthServiceInterface {
  Future<LoginResponse> login(LoginRequest request);
  Future<LoginResponse> refreshToken(RefreshTokenRequest request);
}
