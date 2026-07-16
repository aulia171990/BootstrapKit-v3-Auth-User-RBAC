import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'config.dart';
import 'models.dart';

/// ApiClient — thin HTTP client untuk Laravel API (JWT bearer).
///
/// Respons backend dibungkus `{success, message, data}`. Di sini kita:
///  - lempar [ApiException] kalau `success == false` / status >= 400
///  - kembalikan isi `data` (atau seluruh body kalau tak ada `data`).
class ApiClient {
  static const String _tokenKey = 'ojol_token';

  final http.Client _http;
  String? _token;

  ApiClient({http.Client? client}) : _http = client ?? http.Client();

  /// Muat token dari local storage (panggil sekali saat app start).
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
  }

  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  Map<String, String> get _headers {
    final h = {'Accept': 'application/json'};
    if (_token != null) h['Authorization'] = 'Bearer $_token';
    return h;
  }

  Future<dynamic> _request(String method, String path,
      {Map<String, dynamic>? body, bool auth = true}) async {
    if (auth && _token == null) throw ApiException('Belum login');

    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.apiPrefix}$path');
    final req = http.Request(method, uri);
    req.headers.addAll(_headers);
    if (body != null) {
      req.headers['Content-Type'] = 'application/json';
      req.body = jsonEncode(body);
    }

    final stream = await _http.send(req);
    final res = await http.Response.fromStream(stream);
    return _handle(res);
  }

  dynamic _handle(http.Response res) {
    dynamic payload;
    try {
      payload = jsonDecode(res.body);
    } catch (_) {
      payload = null;
    }

    if (res.statusCode == 401) {
      throw ApiException('Unauthorized');
    }
    if (res.statusCode >= 400) {
      final msg = payload is Map ? (payload['message'] ?? 'Request gagal') : 'Request gagal';
      throw ApiException(msg.toString());
    }

    if (payload is Map && payload['success'] == false) {
      throw ApiException(payload['message']?.toString() ?? 'Request gagal');
    }

    if (payload is Map && payload.containsKey('data')) return payload['data'];
    return payload;
  }

  // ── Auth ───────────────────────────────────────────────
  Future<String> login(String email, String password) async {
    final d = await _request('POST', '/auth/login',
        body: {'email': email, 'password': password}, auth: false);
    final token = d['token'] as String;
    await setToken(token);
    return token;
  }

  Future<void> logout() async {
    try {
      await _request('POST', '/auth/logout');
    } catch (_) {
      // abaikan error, tetap hapus token lokal
    }
    await clearToken();
  }

  Future<User> me() async {
    final d = await _request('GET', '/auth/me');
    return User.fromJson(_asMap(d));
  }

  Future<User> register(
      String name, String email, String phone, String password,
      {String role = 'customer'}) async {
    final d = await _request('POST', '/auth/register',
        body: {'name': name, 'email': email, 'phone': phone, 'password': password, 'role': role},
        auth: false);
    return User.fromJson(_asMap(d));
  }

  // ── Orders ─────────────────────────────────────────────
  Future<List<Order>> orders() async {
    final d = await _request('GET', '/orders');
    // Admin/driver: paginate {data:[...]}; customer: bisa array langsung.
    final list = d is Map && d['data'] is List ? d['data'] : (d is List ? d : []);
    return (list as List).map((e) => Order.fromJson(e)).toList();
  }

  Future<Order> order(String id) async {
    final d = await _request('GET', '/orders/$id');
    return Order.fromJson(_asMap(d));
  }

  Future<Order> createOrder({
    required double pickupLat,
    required double pickupLng,
    String? pickupAddress,
    required double dropoffLat,
    required double dropoffLng,
    String? dropoffAddress,
    double? distanceKm,
    double? price,
  }) async {
    final d = await _request('POST', '/orders', body: {
      'pickup_lat': pickupLat,
      'pickup_lng': pickupLng,
      if (pickupAddress != null) 'pickup_address': pickupAddress,
      'dropoff_lat': dropoffLat,
      'dropoff_lng': dropoffLng,
      if (dropoffAddress != null) 'dropoff_address': dropoffAddress,
      if (distanceKm != null) 'distance_km': distanceKm,
      if (price != null) 'price': price,
    });
    return Order.fromJson(_asMap(d));
  }

  Future<Order> acceptOrder(String id) async {
    final d = await _request('POST', '/orders/$id/accept');
    return Order.fromJson(_asMap(d));
  }

  Future<Order> updateStatus(String id, String status) async {
    final d = await _request('PATCH', '/orders/$id/status', body: {'status': status});
    return Order.fromJson(_asMap(d));
  }

  Future<Map<String, dynamic>> track(String id) async {
    final d = await _request('GET', '/orders/$id/track');
    return d is Map ? Map<String, dynamic>.from(d) : {};
  }

  Future<void> pushLocation(String id, double lat, double lng,
      {double? heading, double? speed}) async {
    final body = {
      'latitude': lat,
      'longitude': lng,
      if (heading != null) 'heading': heading,
      if (speed != null) 'speed': speed,
    };
    await _request('POST', '/orders/$id/location', body: body);
  }

  // ── Payment ────────────────────────────────────────────
  Future<Payment> pay(String id, String method) async {
    final d = await _request('POST', '/orders/$id/pay', body: {'method': method});
    return Payment.fromJson(_asMap(d));
  }

  Future<Payment> paymentStatus(String id) async {
    final d = await _request('GET', '/orders/$id/payment');
    return Payment.fromJson(_asMap(d));
  }

  /// jsonDecode menghasilkan Map<dynamic, dynamic>; model butuh Map<String, dynamic>.
  static Map<String, dynamic> _asMap(dynamic d) =>
      d is Map ? Map<String, dynamic>.from(d) : <String, dynamic>{};
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}
