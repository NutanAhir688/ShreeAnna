import 'dart:io';
import 'package:flutter/material.dart';

class DocumentDownloader {
  /// Resolves the user's system Downloads folder path across Linux, Android, Windows, macOS
  static Future<Directory> getDownloadsDirectory() async {
    Directory? dir;

    if (Platform.isLinux || Platform.isMacOS) {
      final home = Platform.environment['HOME'];
      if (home != null && home.isNotEmpty) {
        final downloads = Directory('$home/Downloads');
        if (await downloads.exists()) {
          dir = downloads;
        } else {
          dir = Directory(home);
        }
      }
    } else if (Platform.isWindows) {
      final userProfile = Platform.environment['USERPROFILE'];
      if (userProfile != null && userProfile.isNotEmpty) {
        final downloads = Directory('$userProfile\\Downloads');
        if (await downloads.exists()) {
          dir = downloads;
        } else {
          dir = Directory(userProfile);
        }
      }
    } else if (Platform.isAndroid) {
      final downloads = Directory('/storage/emulated/0/Download');
      if (await downloads.exists()) {
        dir = downloads;
      } else {
        dir = Directory('/sdcard/Download');
      }
    }

    dir ??= Directory.current;
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  /// Writes string content to a file in the user's Downloads directory and returns the File object
  static Future<File?> downloadFile({
    required String filename,
    required String content,
  }) async {
    try {
      final downloadsDir = await getDownloadsDirectory();
      final filePath = '${downloadsDir.path}/$filename';
      final file = File(filePath);
      await file.writeAsString(content, flush: true);
      debugPrint('Successfully saved file: ${file.path}');
      return file;
    } catch (e) {
      debugPrint('DocumentDownloader Error: $e');
      return null;
    }
  }

  /// Writes binary byte content (e.g. PDF) to a file in the user's Downloads directory and returns the File object
  static Future<File?> downloadBytes({
    required String filename,
    required List<int> bytes,
  }) async {
    try {
      final downloadsDir = await getDownloadsDirectory();
      final filePath = '${downloadsDir.path}/$filename';
      final file = File(filePath);
      await file.writeAsBytes(bytes, flush: true);
      debugPrint('Successfully saved binary PDF file: ${file.path}');
      return file;
    } catch (e) {
      debugPrint('DocumentDownloader Error: $e');
      return null;
    }
  }
}
