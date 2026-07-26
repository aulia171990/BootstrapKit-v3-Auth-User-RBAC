import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'api_client.dart';
import 'auth_provider.dart';
import 'config.dart';
import 'screens/login_screen.dart';
import 'screens/orders_screen.dart';

void main() {
  // baseUrl default di config.dart (127.0.0.1). Android emulator ubah jadi
  // ApiConfig.baseUrl = 'http://10.0.2.2:8000'; di sini sebelum api.

  final api = ApiClient();
  final auth = AuthProvider(api);

  runApp(
    ChangeNotifierProvider.value(
      value: auth,
      child: const OjolApp(),
    ),
  );
}

class OjolApp extends StatelessWidget {
  const OjolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ojol Online',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.green),
      home: const _Bootstrap(),
      routes: {
        '/orders': (_) => const OrdersScreen(),
        '/login': (_) => const LoginScreen(),
      },
    );
  }
}

/// Tentukan halaman awal berdasarkan status login (token + /auth/me).
class _Bootstrap extends StatefulWidget {
  const _Bootstrap();
  @override
  State<_Bootstrap> createState() => _BootstrapState();
}

class _BootstrapState extends State<_Bootstrap> {
  @override
  void initState() {
    super.initState();
    context.read<AuthProvider>().init().then((_) {
      if (!mounted) return;
      final auth = context.read<AuthProvider>();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => auth.isAuthenticated ? const OrdersScreen() : const LoginScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: CircularProgressIndicator()));
}
