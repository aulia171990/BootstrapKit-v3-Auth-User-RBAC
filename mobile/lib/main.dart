import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'api_client.dart';
import 'auth_provider.dart';
import 'config.dart';
import 'screens/login_screen.dart';
import 'screens/orders_screen.dart';

void main() {
  // Auto-detect baseUrl per platform:
  //  - Android emulator  → 10.0.2.2 (loopback ke host)
  //  - iOS sim / desktop → 127.0.0.1
  //  - device fisik      → ganti manual ke IP LAN komputer.
  ApiConfig.baseUrl = 'http://127.0.0.1:8000';
  // ApiConfig.baseUrl = 'http://10.0.2.2:8000';           // android emulator
  // ApiConfig.baseUrl = 'http://192.168.x.x:8000';         // device fisik

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
