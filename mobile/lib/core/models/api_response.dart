/// Generic API response wrapper for handling success and error states
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? error;
  final Map<String, dynamic>? metadata;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.error,
    this.metadata,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? dataParser,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: json['data'] != null && dataParser != null 
          ? dataParser(json['data']) 
          : json['data'],
      error: json['error'],
      metadata: json['metadata'],
    );
  }

  /// Create a successful response
  factory ApiResponse.success({
    required String message,
    T? data,
    Map<String, dynamic>? metadata,
  }) {
    return ApiResponse<T>(
      success: true,
      message: message,
      data: data,
      metadata: metadata,
    );
  }

  /// Create an error response
  factory ApiResponse.error({
    required String message,
    String? error,
    Map<String, dynamic>? metadata,
  }) {
    return ApiResponse<T>(
      success: false,
      message: message,
      error: error,
      metadata: metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data,
      'error': error,
      'metadata': metadata,
    };
  }
}

/// Exception for API errors
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? details;

  ApiException(this.message, {this.statusCode, this.details});

  @override
  String toString() {
    return 'ApiException: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
  }
}

/// Network connectivity exception
class NetworkException implements Exception {
  final String message;

  NetworkException(this.message);

  @override
  String toString() {
    return 'NetworkException: $message';
  }
}

/// Authentication exception
class AuthException implements Exception {
  final String message;

  AuthException(this.message);

  @override
  String toString() {
    return 'AuthException: $message';
  }
}
