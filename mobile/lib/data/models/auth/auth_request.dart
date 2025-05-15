/// Request model for authenticating users
class AuthRequest {
  final String username;
  final String password;

  AuthRequest({
    required this.username,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'password': password,
    };
  }

  factory AuthRequest.fromJson(Map<String, dynamic> json) {
    return AuthRequest(
      username: json['username'],
      password: json['password'],
    );
  }
}