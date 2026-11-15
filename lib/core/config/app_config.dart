class AppConfig {
  static const String defaultApiUrl = 'https://weekly-worklist-angular-1.onrender.com/api/v1';

  /// Allows runtime compile-time override using `--dart-define=API_URL=https://...`
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: defaultApiUrl,
  );

  /// 35-second connect timeout to gracefully handle Render Free Tier cold-start wakeups
  static const Duration connectTimeout = Duration(seconds: 35);
  static const Duration receiveTimeout = Duration(seconds: 35);

  static const String appTitle = 'Weekly Worklist';
}
