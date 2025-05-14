// services/qrService.js
exports.generateQRCode = async (data) => {
  // In actual implementation, use `qrcode` npm package or other service
  return `QR-${data}-${Date.now()}`; // Placeholder
};
