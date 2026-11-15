import 'package:dio/dio.dart';
import '../config/app_config.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final Map<String, dynamic>? errors;

  ApiException({
    this.statusCode,
    required this.message,
    this.errors,
  });

  @override
  String toString() => message;
}

class ApiClient {
  late final Dio dio;

  ApiClient({String? baseUrl}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? AppConfig.apiUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          final customException = _handleDioError(e);
          return handler.reject(
            DioException(
              requestOptions: e.requestOptions,
              response: e.response,
              type: e.type,
              error: customException,
              message: customException.message,
            ),
          );
        },
      ),
    );
  }

  ApiException _handleDioError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.sendTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return ApiException(
        statusCode: 408,
        message: 'Server connection timed out. If the backend is waking up from sleep, please try again in a few seconds.',
      );
    }

    if (e.type == DioExceptionType.connectionError) {
      return ApiException(
        statusCode: 0,
        message: 'Network offline. Check your internet connection or backend server status.',
      );
    }

    if (e.response != null) {
      final data = e.response?.data;
      if (data is Map<String, dynamic>) {
        // Parse ASP.NET Core ApiErrorResponse { status, error, message, path, errors }
        final msg = data['message'] as String? ?? 'An error occurred';
        final errors = data['errors'] as Map<String, dynamic>?;
        
        String finalMsg = msg;
        if (errors != null && errors.isNotEmpty) {
          final errorDetails = errors.values.join(', ');
          finalMsg = '$msg: $errorDetails';
        }

        return ApiException(
          statusCode: e.response?.statusCode,
          message: finalMsg,
          errors: errors,
        );
      }
      return ApiException(
        statusCode: e.response?.statusCode,
        message: 'Server returned HTTP ${e.response?.statusCode}',
      );
    }

    return ApiException(message: e.message ?? 'Unknown communication error');
  }
}
