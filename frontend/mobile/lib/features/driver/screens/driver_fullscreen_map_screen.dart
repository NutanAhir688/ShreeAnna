import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import '../../../core/network/api_config.dart';
import '../models/driver_dispatch_model.dart';

class DriverFullScreenMapScreen extends StatefulWidget {
  final DriverDispatchModel dispatch;
  final VoidCallback? onOpenGoogleMaps;
  final List<LatLng>? initialRoutePoints;
  final LatLng? from;
  final LatLng? to;
  final double? distanceKm;
  final int? durationMin;

  const DriverFullScreenMapScreen({
    super.key,
    required this.dispatch,
    this.onOpenGoogleMaps,
    this.initialRoutePoints,
    this.from,
    this.to,
    this.distanceKm,
    this.durationMin,
  });

  @override
  State<DriverFullScreenMapScreen> createState() => _DriverFullScreenMapScreenState();
}

class _DriverFullScreenMapScreenState extends State<DriverFullScreenMapScreen> {
  final MapController _mapController = MapController();
  List<LatLng> _routePoints = [];
  LatLng? _from;
  LatLng? _to;
  double? _distanceKm;
  int? _durationMin;
  bool _mapReady = false;

  @override
  void initState() {
    super.initState();
    _from = widget.from;
    _to = widget.to;
    _distanceKm = widget.distanceKm;
    _durationMin = widget.durationMin;
    _routePoints = widget.initialRoutePoints ?? [];

    if (_routePoints.isEmpty && _from != null && _to != null) {
      _fetchRoadRoute(_from!, _to!);
    }
  }

  Future<void> _fetchRoadRoute(LatLng start, LatLng end) async {
    try {
      final url = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/'
        '${start.longitude},${start.latitude};${end.longitude},${end.latitude}'
        '?overview=full&geometries=geojson',
      );
      final res = await http.get(url, headers: {
        'User-Agent': 'ShreeAnnaApp/1.0 (com.shreeanna.app; contact@shreeanna.com)',
      }).timeout(const Duration(seconds: 8));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['code'] == 'Ok' && data['routes'] != null && (data['routes'] as List).isNotEmpty) {
          final route = data['routes'][0];
          final geometry = route['geometry'];
          final coords = geometry['coordinates'] as List<dynamic>;
          final pts = coords.map<LatLng>((c) {
            final lon = (c[0] as num).toDouble();
            final lat = (c[1] as num).toDouble();
            return LatLng(lat, lon);
          }).toList();

          final distanceM = (route['distance'] as num?)?.toDouble() ?? 0;
          final durationS = (route['duration'] as num?)?.toDouble() ?? 0;

          if (mounted && pts.isNotEmpty) {
            setState(() {
              _routePoints = pts;
              _distanceKm = distanceM / 1000.0;
              _durationMin = (durationS / 60.0).round();
            });
            _fitMapBounds();
            return;
          }
        }
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        _routePoints = [start, end];
      });
      _fitMapBounds();
    }
  }

  void _fitMapBounds() {
    if (!_mapReady || !mounted) return;
    final points = _routePoints.isNotEmpty
        ? _routePoints
        : (_from != null && _to != null ? [_from!, _to!] : null);
    if (points == null || points.isEmpty) return;

    try {
      final bounds = LatLngBounds.fromPoints(points);
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: bounds,
          padding: const EdgeInsets.only(top: 100, bottom: 220, left: 40, right: 40),
        ),
      );
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final statusUpper = widget.dispatch.status.toUpperCase();
    final isInTransit = statusUpper == 'IN_TRANSIT' || statusUpper == 'DELIVERED';
    final targetLocation = isInTransit
        ? widget.dispatch.destinationAddress
        : widget.dispatch.sourceAddress;
    final headerColor = isInTransit ? const Color(0xFF0284C7) : const Color(0xFF059669);
    final lineColor = isInTransit ? const Color(0xFF38BDF8) : const Color(0xFF34D399);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // ── Full-Screen Map ────────────────────────────────────────────────
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _to ?? const LatLng(22.3039, 70.8022),
              initialZoom: 12,
              onMapReady: () {
                _mapReady = true;
                _fitMapBounds();
              },
            ),
            children: [
              // Carto / OpenStreetMap tile layer
              TileLayer(
                urlTemplate: ApiConfig.cartoApiKey.isNotEmpty
                    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${ApiConfig.cartoApiKey}'
                    : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.shreeanna.app',
                tileProvider: NetworkTileProvider(
                  headers: <String, String>{
                    'User-Agent': 'ShreeAnnaApp/1.0 (com.shreeanna.app; contact@shreeanna.com)',
                  },
                ),
                maxZoom: 20,
              ),

              // Road Route Polylines
              if (_routePoints.isNotEmpty || (_from != null && _to != null))
                PolylineLayer(
                  polylines: [
                    // Outer dark road casing for high contrast
                    Polyline(
                      points: _routePoints.isNotEmpty ? _routePoints : [_from!, _to!],
                      color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                      strokeWidth: 8,
                    ),
                    // Vibrant navigation blue polyline
                    Polyline(
                      points: _routePoints.isNotEmpty ? _routePoints : [_from!, _to!],
                      color: const Color(0xFF2563EB),
                      strokeWidth: 5.5,
                    ),
                  ],
                ),

              // Markers
              MarkerLayer(
                markers: [
                  // Driver Marker
                  if (_from != null)
                    Marker(
                      point: _from!,
                      width: 90,
                      height: 40,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B).withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.amber, width: 1.5),
                          boxShadow: const [
                            BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 3)),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.local_shipping, color: Colors.amber, size: 16),
                            SizedBox(width: 4),
                            Text(
                              'Driver',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Destination Marker
                  if (_to != null)
                    Marker(
                      point: _to!,
                      width: 120,
                      height: 40,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: headerColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white, width: 1.5),
                          boxShadow: const [
                            BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 3)),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isInTransit ? Icons.warehouse : Icons.agriculture,
                              color: Colors.white,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                isInTransit ? 'Warehouse' : 'Farmer Farm',
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),

              // Attribution
              RichAttributionWidget(
                attributions: [
                  TextSourceAttribution(
                    ApiConfig.cartoApiKey.isNotEmpty
                        ? '© CARTO, © OpenStreetMap contributors'
                        : 'OpenStreetMap contributors',
                  ),
                ],
              ),
            ],
          ),

          // ── Top Navigation Bar ──────────────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  // Back Button
                  InkWell(
                    onTap: () => Navigator.pop(context),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF334155)),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 2)),
                        ],
                      ),
                      child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Route Title Card
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF334155)),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(0, 2)),
                        ],
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isInTransit ? Icons.warehouse_outlined : Icons.navigation_outlined,
                            color: lineColor,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  isInTransit ? 'WAREHOUSE ROUTE' : 'PICKUP LOCATION MAP',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF94A3B8),
                                    letterSpacing: 0.4,
                                  ),
                                ),
                                Text(
                                  widget.dispatch.dispatchCode.isNotEmpty
                                      ? '#${widget.dispatch.dispatchCode}'
                                      : 'Active Dispatch',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: headerColor,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              isInTransit ? 'IN TRANSIT' : 'TRANSIT',
                              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Map Zoom Controls (Right Side) ──────────────────────────────────
          Positioned(
            right: 16,
            top: 130,
            child: Column(
              children: [
                // Zoom In
                InkWell(
                  onTap: () {
                    final zoom = _mapController.camera.zoom;
                    _mapController.move(_mapController.camera.center, zoom + 1);
                  },
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                      boxShadow: const [
                        BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                      ],
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 20),
                  ),
                ),
                const SizedBox(height: 8),
                // Zoom Out
                InkWell(
                  onTap: () {
                    final zoom = _mapController.camera.zoom;
                    _mapController.move(_mapController.camera.center, zoom - 1);
                  },
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                      boxShadow: const [
                        BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                      ],
                    ),
                    child: const Icon(Icons.remove, color: Colors.white, size: 20),
                  ),
                ),
                const SizedBox(height: 8),
                // Fit Bounds / Re-center
                InkWell(
                  onTap: _fitMapBounds,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF334155)),
                      boxShadow: const [
                        BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                      ],
                    ),
                    child: const Icon(Icons.center_focus_strong, color: Color(0xFF38BDF8), size: 18),
                  ),
                ),
              ],
            ),
          ),

          // ── Bottom Navigation Card ──────────────────────────────────────────
          Positioned(
            left: 16,
            right: 16,
            bottom: 24,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155), width: 1.5),
                boxShadow: const [
                  BoxShadow(color: Color(0x3F000000), blurRadius: 16, offset: Offset(0, 6)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Distance & ETA header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.directions_car, color: Color(0xFF38BDF8), size: 18),
                          const SizedBox(width: 6),
                          Text(
                            _distanceKm != null
                                ? '${_distanceKm!.toStringAsFixed(1)} km · ~${_durationMin ?? 0}m drive'
                                : 'Calculating route…',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      if (_to != null)
                        Text(
                          '${_to!.latitude.toStringAsFixed(4)}°N, ${_to!.longitude.toStringAsFixed(4)}°E',
                          style: TextStyle(
                            fontSize: 10,
                            color: lineColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFF334155), height: 1),
                  const SizedBox(height: 8),

                  // Destination Details
                  Row(
                    children: [
                      Icon(
                        isInTransit ? Icons.warehouse_outlined : Icons.location_on_outlined,
                        color: lineColor,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isInTransit ? 'DESTINATION WAREHOUSE' : 'FARMER PICKUP LOCATION',
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              targetLocation,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Action Buttons
                  Row(
                    children: [
                      // Re-center button
                      OutlinedButton.icon(
                        onPressed: _fitMapBounds,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFF475569)),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.crop_free, size: 16),
                        label: const Text('Center', style: TextStyle(fontSize: 12)),
                      ),
                      const SizedBox(width: 8),

                      // Google Maps Navigation button
                      if (widget.onOpenGoogleMaps != null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: widget.onOpenGoogleMaps,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF1976D2),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              elevation: 2,
                            ),
                            icon: const Icon(Icons.navigation, size: 16),
                            label: const Text(
                              'OPEN IN GOOGLE MAPS',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
