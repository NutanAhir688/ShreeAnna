class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:5066';

  static const String sendFarmerOtp = '$baseUrl/api/auth/farmer/send-otp';

  static const String verifyFarmerOtp = '$baseUrl/api/auth/farmer/verify-otp';

  static const String farmerMe = '$baseUrl/api/farmers/me';

  static String farmerFarms(String farmerId) =>
      '$baseUrl/api/farmers/$farmerId/farms';

  static String farmById(String farmId) => '$baseUrl/api/farms/$farmId';

  static String verifyFarm(String farmId) =>
      '$baseUrl/api/farms/$farmId/verify';

  static String archiveFarm(String farmId) =>
      '$baseUrl/api/farms/$farmId/archive';

  static String registerFarmer = '$baseUrl/api/farmers/register';

  static String registerFarm = '$baseUrl/api/farms/register';

  static const String uploadImage = '$baseUrl/api/upload';

  /// Returns a signed SAS write URL for a given file extension.
  /// Usage: GET [uploadSasUrl]?ext=jpg
  static const String uploadSasUrl = '$baseUrl/api/upload/sas';

  static const String azureBlobBaseUrl =
      'https://shreeannafarmimages.blob.core.windows.net/farm-images';

  static String azureSasToken = '';
}
