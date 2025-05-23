import 'package:mobile/data/models/user.dart';

/// Response model for authentication
class AuthResponse {
  final String token;
  final String refreshToken;
  final User user;
  final int expiresIn;

  AuthResponse({
    required this.token,
    required this.refreshToken,
    required this.user,
    required this.expiresIn,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      refreshToken: json['refreshToken'],
      user: User.fromJson(json['user']),
      expiresIn: json['expiresIn'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'refreshToken': refreshToken,
      'user': user.toJson(),
      'expiresIn': expiresIn,
    };
  }
}