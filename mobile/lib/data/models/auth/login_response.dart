import 'package:mobile/data/models/user.dart';
import 'package:mobile/data/models/auth/auth_response.dart';

class LoginResponse {
  final String token;
  final String refreshToken;
  final User user;
  final int expiresIn;

  LoginResponse({
    required this.token, 
    required this.refreshToken, 
    required this.user, 
    required this.expiresIn
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'],
      refreshToken: json['refreshToken'],
      user: User.fromJson(json['user']),
      expiresIn: json['expiresIn'],
    );
  }
  
  // Convert LoginResponse to AuthResponse
  AuthResponse toAuthResponse() {
    return AuthResponse(
      token: token,
      refreshToken: refreshToken,
      user: user,
      expiresIn: expiresIn,
    );
  }
}
