const faviconsContext = require.context("../assets/favicons", true, /\.(svg|png|ico|xml|json|webmanifest)$/);
faviconsContext.keys().forEach(faviconsContext);
