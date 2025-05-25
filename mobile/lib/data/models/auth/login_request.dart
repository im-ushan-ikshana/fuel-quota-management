class LoginRequest {
  final String username;
  final String password;

  LoginRequest({required this.username, required this.password});

  // Backward compatibility getter
  String get email => username;

  Map<String, dynamic> toJson() {
    return {
      'email': username,  // Backend expects email field
      'username': username,
      'password': password,
    };
  }
}
