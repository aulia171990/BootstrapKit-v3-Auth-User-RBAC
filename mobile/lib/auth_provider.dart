import 'package:flutter/material.dart';

import 'api_client.dart';
import 'models.dart';

/// State global: ApiClient + user login. Dipakai di seluruh screen.
class AuthProvider extends ChangeNotifier {
  final ApiClient api;
  User? user;
  bool loading = true;

  AuthProvider(this.api);

  Future<void> init() async {
    await api.loadToken();
    if (api.isAuthenticated) {
      try {
        user = await api.me();
      } catch (_) {
        await api.clearToken();
      }
    }
    loading = false;
    notifyListeners();
  }

  bool get isAuthenticated => api.isAuthenticated && user != null;

  Future<void> login(String email, String password) async {
    await api.login(email, password);
    user = await api.me();
    notifyListeners();
  }

  Future<void> register(
      String name, String email, String phone, String password,
      {String role = 'customer'}) async {
    await api.register(name, email, phone, password, role: role);
    await login(email, password);
  }

  Future<void> logout() async {
    await api.logout();
    user = null;
    notifyListeners();
  }

  Future<void> refreshMe() async {
    try {
      user = await api.me();
      notifyListeners();
    } catch (_) {}
  }
}
