import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/qr_code_generator/sample_qr_generator.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fuel Quota Manager',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/sample-qr': (context) => const SampleQRCodeGenerator(),
      },
    );
  }
}