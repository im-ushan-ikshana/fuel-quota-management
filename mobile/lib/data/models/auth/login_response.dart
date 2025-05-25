import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/models/auth/auth_response.dart';

class LoginResponse {
  final String accessToken;
  final String? refreshToken;
  final User user;
  final String expiresIn;
  LoginResponse({
    required this.accessToken, 
    this.refreshToken, 
    required this.user, 
    required this.expiresIn
  });

  // Backward compatibility getter
  User get operator => user;

  // Factory for backend API response
  factory LoginResponse.fromBackendJson(Map<String, dynamic> json) {
    final data = json['data'] ?? json;
    return LoginResponse(
      accessToken: data['accessToken'],
      refreshToken: data['refreshToken'],
      user: User.fromOperatorResponse(data),
      expiresIn: data['expiresIn'] ?? '24h',
    );
  }

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['token'] ?? json['accessToken'],
      refreshToken: json['refreshToken'],
      user: User.fromJson(json['user']),
      expiresIn: json['expiresIn']?.toString() ?? '24h',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'user': user.toJson(),
      'expiresIn': expiresIn,
    };
  }
  
  // Convert LoginResponse to AuthResponse (for backward compatibility)
  AuthResponse toAuthResponse() {
    return AuthResponse(
      token: accessToken,
      refreshToken: refreshToken ?? '',
      user: user,
      expiresIn: int.tryParse(expiresIn.replaceAll(RegExp(r'[^0-9]'), '')) ?? 24,
    );
  }
}
