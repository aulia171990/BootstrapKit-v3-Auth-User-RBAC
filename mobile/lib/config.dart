/// Konfigurasi global aplikasi mobile Ojol.
///
/// API Laravel jalan di `:8000`. Untuk emulator Android pakai `10.0.2.2`
/// (bukan 127.0.0.1). Untuk device fisik pakai IP LAN komputer kamu
/// (mis. 192.168.x.x:8000) dan pastikan `APP_URL`/CORS di Laravel mengizinkan.
class ApiConfig {
  // Default untuk Android emulator. Ubah lewat ApiConfig.baseUrl = '...'
  // sebelum memanggil API (mis. di main() berdasarkan arg/env).
  static String baseUrl = 'http://10.0.2.2:8000';

  static const String apiPrefix = '/api/v1';

  /// Reverb WebSocket host (port 8080 di backend). Belum dipakai di v1
  /// (tracking memakai polling), disiapkan untuk upgrade realtime.
  static String wsHost = '10.0.2.2';
  static const int wsPort = 8080;
}
