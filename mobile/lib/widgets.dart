import 'package:flutter/material.dart';

/// Warna & label badge status order (sama dengan frontend React).
const Map<String, Color> _statusColors = {
  'pending': Colors.grey,
  'accepted': Colors.orange,
  'ongoing': Colors.blue,
  'completed': Colors.green,
  'cancelled': Colors.red,
};

Color statusColor(String? s) => _statusColors[s] ?? Colors.grey;

Widget statusBadge(String status) {
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: statusColor(status),
      borderRadius: BorderRadius.circular(12),
    ),
    child: Text(
      status,
      style: const TextStyle(color: Colors.white, fontSize: 12),
    ),
  );
}

String money(double? v) {
  if (v == null) return '-';
  return 'Rp ${v.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
}
