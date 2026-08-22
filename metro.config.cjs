const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Block jsPDF from native bundles — it uses latin1/Buffer which crashes Hermes.
// On native, generatePdfInvoice() shows an Alert instead.
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web' && moduleName === 'jspdf') {
    // Return an empty stub module so the dynamic import() never throws on native
    return {
      filePath: path.resolve(__dirname, 'src/lib/jspdf-stub.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
