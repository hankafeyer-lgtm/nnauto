// // import express, { type Request, Response, NextFunction } from "express";
// // import compression from "compression";
// // import { registerRoutes } from "./routes";
// // import { setupVite, serveStatic, log } from "./vite";
// // import { storage } from "./storage";
// // import bcrypt from "bcrypt";
// // import "dotenv/config";
// // import {
// //   R2StorageService,
// //   ObjectPermission,
// //   ObjectNotFoundError,
// // } from "./r2Storage";
// // const app = express();

// // // Enable gzip compression for all responses
// // app.use(
// //   compression({
// //     level: 6,
// //     threshold: 1024,
// //     filter: (req, res) => {
// //       if (req.headers["x-no-compression"]) {
// //         return false;
// //       }
// //       return compression.filter(req, res);
// //     },
// //   }),
// // );

// // // Add caching headers for static assets
// // app.use((req, res, next) => {
// //   const path = req.path;

// //   // Cache hashed assets (Vite outputs like /assets/index-ABC12345.js) for 1 year
// //   if (
// //     path.match(/[-\.][a-f0-9]{8,}\.(js|css)$/i) ||
// //     path.startsWith("/assets/")
// //   ) {
// //     res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
// //   }
// //   // Cache images for 1 month
// //   else if (path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
// //     res.setHeader("Cache-Control", "public, max-age=2592000");
// //   }
// //   // Cache fonts for 1 year
// //   else if (path.match(/\.(woff2?|ttf|eot|otf)$/i)) {
// //     res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
// //   }
// //   // Cache favicon.ico for 1 week
// //   else if (path === "/favicon.ico") {
// //     res.setHeader("Cache-Control", "public, max-age=604800");
// //   }

// //   next();
// // });

// // // Initialize admin user if doesn't exist
// // async function seedAdminUser() {
// //   const adminEmail = "admin@zlateauto.cz";
// //   const existingAdmin = await storage.getUserByEmail(adminEmail);

// //   if (existingAdmin) {
// //     log("Admin user already exists");
// //     return;
// //   }

// //   const hashedPassword = await bcrypt.hash("admin123", 10);
// //   await storage.createUser({
// //     email: adminEmail,
// //     username: "admin",
// //     password: hashedPassword,
// //     firstName: "Admin",
// //     lastName: "User",
// //     isAdmin: true,
// //   });

// //   log("Created admin user: admin@zlateauto.cz / admin123");
// // }

// // // Initialize demo listings (only if storage is empty)
// // async function seedDemoListings() {
// //   // Check if listings already exist
// //   const existingListings = await storage.getListings();
// //   if (existingListings.length > 0) {
// //     log(`Skipping seed - found ${existingListings.length} existing listings`);
// //     return;
// //   }

// //   const demoListings = [
// //     {
// //       userId: "demo-user",
// //       brand: "Toyota",
// //       model: "Camry",
// //       title: "Toyota Camry 2.5 Hybrid",
// //       description:
// //         "Velmi pěkný hybrid v perfektním stavu. Pravidelný servis, garáž.",
// //       price: "637500",
// //       year: 2021,
// //       mileage: 45000,
// //       fuelType: ["hybrid"],
// //       transmission: ["automatic"],
// //       bodyType: "sedan",
// //       color: "silver",
// //       driveType: ["fwd"],
// //       engineVolume: "2.5",
// //       power: 218,
// //       doors: 4,
// //       seats: 5,
// //       region: "prague",
// //       category: "used",
// //       vehicleType: "osobni-auta",
// //       isTopListing: false,
// //       vatDeductible: true,
// //       isImported: false,
// //       importCountry: null,
// //       sellerType: "private",
// //       owners: 1,
// //       condition: "used",
// //       vin: "",
// //     },
// //     {
// //       userId: "demo-user",
// //       brand: "BMW",
// //       model: "X5",
// //       title: "BMW X5 xDrive40i",
// //       description:
// //         "Luxusní SUV s kompletní výbavou. Kůže, pano výbava, navigace.",
// //       price: "1472500",
// //       year: 2022,
// //       mileage: 28000,
// //       fuelType: ["benzin"],
// //       transmission: ["automatic"],
// //       bodyType: "suv",
// //       color: "black",
// //       driveType: ["awd"],
// //       engineVolume: "3.0",
// //       power: 340,
// //       doors: 5,
// //       seats: 7,
// //       region: "brno",
// //       category: "used",
// //       vehicleType: "osobni-auta",
// //       isTopListing: true,
// //       vatDeductible: true,
// //       isImported: true,
// //       importCountry: "germany",
// //       sellerType: "dealer",
// //       owners: 2,
// //       condition: "used",
// //       vin: "",
// //     },
// //     {
// //       userId: "demo-user",
// //       brand: "Audi",
// //       model: "RS5",
// //       title: "Audi RS5 Sportback",
// //       description:
// //         "Sportovní sedan s fantastickým výkonem. Carbon doplňky, sportovní výfuk.",
// //       price: "1800000",
// //       year: 2024,
// //       mileage: 5000,
// //       fuelType: ["benzin"],
// //       transmission: ["automatic"],
// //       bodyType: "sedan",
// //       color: "blue",
// //       driveType: ["awd"],
// //       engineVolume: "2.9",
// //       power: 450,
// //       doors: 5,
// //       seats: 5,
// //       region: "ostrava",
// //       category: "new",
// //       vehicleType: "osobni-auta",
// //       isTopListing: true,
// //       vatDeductible: true,
// //       isImported: true,
// //       importCountry: "italy",
// //       sellerType: "dealer",
// //       owners: 1,
// //       condition: "new",
// //       vin: "",
// //     },
// //     {
// //       userId: "demo-user",
// //       brand: "Tesla",
// //       model: "Model 3",
// //       title: "Tesla Model 3 Long Range",
// //       description:
// //         "Elektromobil s velkým dojezdem. Autopilot, premium audio systém.",
// //       price: "1125000",
// //       year: 2022,
// //       mileage: 35000,
// //       fuelType: ["electric"],
// //       transmission: ["automatic"],
// //       bodyType: "sedan",
// //       color: "white",
// //       driveType: ["awd"],
// //       engineVolume: null,
// //       power: 462,
// //       doors: 4,
// //       seats: 5,
// //       region: "prague",
// //       category: "used",
// //       vehicleType: "osobni-auta",
// //       isTopListing: false,
// //       vatDeductible: true,
// //       isImported: true,
// //       importCountry: "usa",
// //       sellerType: "private",
// //       owners: 1,
// //       condition: "used",
// //       vin: "",
// //     },
// //     {
// //       userId: "demo-user",
// //       brand: "Škoda",
// //       model: "Fabia",
// //       title: "Škoda Fabia 1.0 TSI",
// //       description:
// //         "Praktický hatchback, ekonomický provoz. Klimatizace, el. okna.",
// //       price: "462500",
// //       year: 2021,
// //       mileage: 52000,
// //       fuelType: ["benzin"],
// //       transmission: ["manual"],
// //       bodyType: "hatchback",
// //       color: "red",
// //       driveType: ["fwd"],
// //       engineVolume: "1.0",
// //       power: 95,
// //       doors: 5,
// //       seats: 5,
// //       region: "plzen",
// //       category: "used",
// //       vehicleType: "osobni-auta",
// //       isTopListing: false,
// //       vatDeductible: false,
// //       isImported: false,
// //       importCountry: null,
// //       sellerType: "private",
// //       owners: 2,
// //       condition: "used",
// //       vin: "",
// //     },
// //     {
// //       userId: "demo-user",
// //       brand: "Ford",
// //       model: "Ranger",
// //       title: "Ford Ranger Raptor",
// //       description: "Terénní pickup s výkonným motorem. Ideální pro dobrodruhy.",
// //       price: "1300000",
// //       year: 2024,
// //       mileage: 2000,
// //       fuelType: ["diesel"],
// //       transmission: ["automatic"],
// //       bodyType: "pickup",
// //       color: "orange",
// //       driveType: ["4wd"],
// //       engineVolume: "3.0",
// //       power: 213,
// //       doors: 4,
// //       seats: 5,
// //       region: "liberec",
// //       category: "new",
// //       vehicleType: "nakladni-vozy",
// //       isTopListing: false,
// //       vatDeductible: true,
// //       isImported: false,
// //       importCountry: null,
// //       sellerType: "dealer",
// //       owners: 1,
// //       condition: "new",
// //       vin: "",
// //     },
// //   ];

// //   for (const listing of demoListings) {
// //     await storage.createListing(listing);
// //   }

// //   log("Initialized 6 demo listings");
// // }

// // declare module "http" {
// //   interface IncomingMessage {
// //     rawBody: unknown;
// //   }
// // }

// // // Skip body parsing for video upload routes (handled by multer)
// // const skipBodyParserFor = (req: Request) => {
// //   return (
// //     req.path === "/api/objects/upload-video" ||
// //     req.headers["content-type"]?.includes("multipart/form-data")
// //   );
// // };

// // app.use((req, res, next) => {
// //   if (skipBodyParserFor(req)) {
// //     return next();
// //   }
// //   express.json({
// //     limit: "1500mb", // Increased limit for base64-encoded images (1000MB + 50% for base64 overhead)
// //     verify: (req: any, _res, buf) => {
// //       req.rawBody = buf;
// //     },
// //   })(req, res, next);
// // });

// // app.use((req, res, next) => {
// //   if (skipBodyParserFor(req)) {
// //     return next();
// //   }
// //   express.urlencoded({ extended: false, limit: "1500mb" })(req, res, next);
// // });

// // // app.use((req, res, next) => {
// // //   const start = Date.now();
// // //   const path = req.path;
// // //   let capturedJsonResponse: Record<string, any> | undefined = undefined;

// // //   const originalResJson = res.json;
// // //   res.json = function (bodyJson, ...args) {
// // //     capturedJsonResponse = bodyJson;
// // //     return originalResJson.apply(res, [bodyJson, ...args]);
// // //   };

// // //   res.on("finish", () => {
// // //     const duration = Date.now() - start;
// // //     if (path.startsWith("/api")) {
// // //       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
// // //       if (capturedJsonResponse) {
// // //         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
// // //       }

// // //       if (logLine.length > 80) {
// // //         logLine = logLine.slice(0, 79) + "…";
// // //       }

// // //       log(logLine);
// // //     }
// // //   });

// // //   next();
// // // });
// // app.use((req, res, next) => {
// //   const start = Date.now();
// //   const path = req.path;

// //   res.on("finish", () => {
// //     if (!path.startsWith("/api")) return;
// //     const duration = Date.now() - start;
// //     log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
// //   });

// //   next();
// // });

// // (async () => {
// //   // Seed admin user and demo listings on startup
// //   await seedAdminUser();
// //   await seedDemoListings();

// //   const server = await registerRoutes(app);

// //   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
// //     const status = err.status || err.statusCode || 500;
// //     const message = err.message || "Internal Server Error";

// //     res.status(status).json({ message });
// //     throw err;
// //   });

// //   // importantly only setup vite in development and after
// //   // setting up all the other routes so the catch-all route
// //   // doesn't interfere with the other routes
// //   if (app.get("env") === "development") {
// //     await setupVite(app, server);
// //   } else {
// //     serveStatic(app);
// //   }

// //   // ALWAYS serve the app on the port specified in the environment variable PORT
// //   // Other ports are firewalled. Default to 5000 if not specified.
// //   // this serves both the API and the client.
// //   // It is the only port that is not firewalled.
// //   const port = parseInt(process.env.PORT || "5000", 10);
// //   server.listen(
// //     {
// //       port,
// //       host: "0.0.0.0",
// //       reusePort: true,
// //     },
// //     () => {
// //       log(`serving on port ${port}`);
// //     },
// //   );
// // })();
// // server/index.ts
// import express, {
//   type NextFunction,
//   type Request,
//   type Response,
// } from "express";
// import compression from "compression";
// import bcrypt from "bcrypt";
// import "dotenv/config";
// import fs from "node:fs";
// import path from "node:path";

// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";
// import { storage } from "./storage";

// const app = express();

// // Якщо хочеш — можеш винести в ENV: PUBLIC_BASE_URL=https://nnauto.cz
// const BASE_URL = process.env.PUBLIC_BASE_URL || "https://nnauto.cz";

// // Боти месенджерів/соцмереж + пошукові (для OG-превʼю)
// const BOT_UA =
//   /facebookexternalhit|Facebot|Twitterbot|TelegramBot|WhatsApp|Viber|Discordbot|Slackbot|LinkedInBot|Googlebot|bingbot|SeznamBot/i;

// declare module "http" {
//   interface IncomingMessage {
//     rawBody: unknown;
//   }
// }

// /* ----------------------------- helpers (OG) ----------------------------- */

// function escapeAttr(value: unknown) {
//   return String(value ?? "")
//     .replaceAll("&", "&amp;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;");
// }

// function normalizeKey(p: string) {
//   return p.replace(/^\/+/, "").trim();
// }

// function findIndexHtmlPath() {
//   // Vite prod build зазвичай: dist/public/index.html або dist/client/index.html
//   const candidates = [
//     path.join(process.cwd(), "dist", "public", "index.html"),
//     path.join(process.cwd(), "dist", "client", "index.html"),
//     path.join(process.cwd(), "dist", "index.html"),
//   ];

//   for (const p of candidates) {
//     if (fs.existsSync(p)) return p;
//   }

//   throw new Error(
//     `index.html not found. Checked:\n${candidates.map((x) => `- ${x}`).join("\n")}`,
//   );
// }

// function readIndexHtml() {
//   const indexPath = findIndexHtmlPath();
//   return fs.readFileSync(indexPath, "utf-8");
// }

// function replaceOrInsertInHead(
//   html: string,
//   needleRegex: RegExp,
//   replacement: string,
// ) {
//   if (needleRegex.test(html)) return html.replace(needleRegex, replacement);

//   // якщо немає тегу — вставимо перед </head>
//   return html.replace(/<\/head>/i, `${replacement}\n  </head>`);
// }

// /**
//  * Підміняє в index.html основні OG/Twitter/Title/Description/Canonical
//  * для шарингу /listing/:id у месенджери.
//  */
// function injectListingOG(
//   html: string,
//   meta: { title: string; description: string; image: string; url: string },
// ) {
//   const t = escapeAttr(meta.title);
//   const d = escapeAttr(meta.description);
//   const img = escapeAttr(meta.image);
//   const url = escapeAttr(meta.url);

//   let out = html;

//   // <title>
//   out = replaceOrInsertInHead(
//     out,
//     /<title>[\s\S]*?<\/title>/i,
//     `  <title>${t}</title>`,
//   );

//   // meta title
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="title" content="${t}" />`,
//   );

//   // meta description
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="description" content="${d}" />`,
//   );

//   // canonical
//   out = replaceOrInsertInHead(
//     out,
//     /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
//     `  <link rel="canonical" href="${url}" />`,
//   );

//   // OG
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta property="og:type" content="product" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta property="og:url" content="${url}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta property="og:title" content="${t}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta property="og:description" content="${d}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta property="og:image" content="${img}" />`,
//   );

//   // og:image:secure_url (додати/замінити)
//   if (!/property="og:image:secure_url"/i.test(out)) {
//     out = out.replace(
//       /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
//       (m) => `${m}\n  <meta property="og:image:secure_url" content="${img}" />`,
//     );
//   } else {
//     out = out.replace(
//       /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
//       `  <meta property="og:image:secure_url" content="${img}" />`,
//     );
//   }

//   // og:image:alt
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta property="og:image:alt" content="${t}" />`,
//   );

//   // Twitter
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="twitter:url" content="${url}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="twitter:title" content="${t}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="twitter:description" content="${d}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="twitter:image" content="${img}" />`,
//   );
//   out = replaceOrInsertInHead(
//     out,
//     /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i,
//     `  <meta name="twitter:image:alt" content="${t}" />`,
//   );

//   return out;
// }

// /* --------------------------- middlewares (core) -------------------------- */

// // Enable gzip compression for all responses
// app.use(
//   compression({
//     level: 6,
//     threshold: 1024,
//     filter: (req, res) => {
//       if (req.headers["x-no-compression"]) return false;
//       return compression.filter(req, res);
//     },
//   }),
// );

// // Add caching headers for static assets
// app.use((req, res, next) => {
//   const p = req.path;

//   // Cache hashed assets (Vite outputs like /assets/index-ABC12345.js) for 1 year
//   if (p.match(/[-\.][a-f0-9]{8,}\.(js|css)$/i) || p.startsWith("/assets/")) {
//     res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
//   }
//   // Cache images for 1 month
//   else if (p.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
//     res.setHeader("Cache-Control", "public, max-age=2592000");
//   }
//   // Cache fonts for 1 year
//   else if (p.match(/\.(woff2?|ttf|eot|otf)$/i)) {
//     res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
//   }
//   // Cache favicon.ico for 1 week
//   else if (p === "/favicon.ico") {
//     res.setHeader("Cache-Control", "public, max-age=604800");
//   }

//   next();
// });

// // Skip body parsing for video upload routes (handled by multer)
// const skipBodyParserFor = (req: Request) => {
//   return (
//     req.path === "/api/objects/upload-video" ||
//     req.headers["content-type"]?.includes("multipart/form-data")
//   );
// };

// app.use((req, res, next) => {
//   if (skipBodyParserFor(req)) return next();

//   express.json({
//     limit: "1500mb",
//     verify: (req: any, _res, buf) => {
//       req.rawBody = buf;
//     },
//   })(req, res, next);
// });

// app.use((req, res, next) => {
//   if (skipBodyParserFor(req)) return next();
//   express.urlencoded({ extended: false, limit: "1500mb" })(req, res, next);
// });

// // Simple API request logging
// app.use((req, res, next) => {
//   const start = Date.now();
//   const p = req.path;

//   res.on("finish", () => {
//     if (!p.startsWith("/api")) return;
//     const duration = Date.now() - start;
//     log(`${req.method} ${p} ${res.statusCode} in ${duration}ms`);
//   });

//   next();
// });

// /* ------------------------------ seed helpers ----------------------------- */

// // Initialize admin user if doesn't exist
// async function seedAdminUser() {
//   const adminEmail = "admin@zlateauto.cz";
//   const existingAdmin = await storage.getUserByEmail(adminEmail);

//   if (existingAdmin) {
//     log("Admin user already exists");
//     return;
//   }

//   const hashedPassword = await bcrypt.hash("admin123", 10);
//   await storage.createUser({
//     email: adminEmail,
//     username: "admin",
//     password: hashedPassword,
//     firstName: "Admin",
//     lastName: "User",
//     isAdmin: true,
//   });

//   log("Created admin user: admin@zlateauto.cz / admin123");
// }

// // Initialize demo listings (only if storage is empty)
// async function seedDemoListings() {
//   const existingListings = await storage.getListings();
//   if (existingListings.length > 0) {
//     log(`Skipping seed - found ${existingListings.length} existing listings`);
//     return;
//   }

//   const demoListings = [
//     {
//       userId: "demo-user",
//       brand: "Toyota",
//       model: "Camry",
//       title: "Toyota Camry 2.5 Hybrid",
//       description:
//         "Velmi pěkný hybrid v perfektním stavu. Pravidelný servis, garáž.",
//       price: "637500",
//       year: 2021,
//       mileage: 45000,
//       fuelType: ["hybrid"],
//       transmission: ["automatic"],
//       bodyType: "sedan",
//       color: "silver",
//       driveType: ["fwd"],
//       engineVolume: "2.5",
//       power: 218,
//       doors: 4,
//       seats: 5,
//       region: "prague",
//       category: "used",
//       vehicleType: "osobni-auta",
//       isTopListing: false,
//       vatDeductible: true,
//       isImported: false,
//       importCountry: null,
//       sellerType: "private",
//       owners: 1,
//       condition: "used",
//       vin: "",
//     },
//     {
//       userId: "demo-user",
//       brand: "BMW",
//       model: "X5",
//       title: "BMW X5 xDrive40i",
//       description:
//         "Luxusní SUV s kompletní výbavou. Kůže, pano výbava, navigace.",
//       price: "1472500",
//       year: 2022,
//       mileage: 28000,
//       fuelType: ["benzin"],
//       transmission: ["automatic"],
//       bodyType: "suv",
//       color: "black",
//       driveType: ["awd"],
//       engineVolume: "3.0",
//       power: 340,
//       doors: 5,
//       seats: 7,
//       region: "brno",
//       category: "used",
//       vehicleType: "osobni-auta",
//       isTopListing: true,
//       vatDeductible: true,
//       isImported: true,
//       importCountry: "germany",
//       sellerType: "dealer",
//       owners: 2,
//       condition: "used",
//       vin: "",
//     },
//     {
//       userId: "demo-user",
//       brand: "Audi",
//       model: "RS5",
//       title: "Audi RS5 Sportback",
//       description:
//         "Sportovní sedan s fantastickým výkonem. Carbon doplňky, sportovní výfuk.",
//       price: "1800000",
//       year: 2024,
//       mileage: 5000,
//       fuelType: ["benzin"],
//       transmission: ["automatic"],
//       bodyType: "sedan",
//       color: "blue",
//       driveType: ["awd"],
//       engineVolume: "2.9",
//       power: 450,
//       doors: 5,
//       seats: 5,
//       region: "ostrava",
//       category: "new",
//       vehicleType: "osobni-auta",
//       isTopListing: true,
//       vatDeductible: true,
//       isImported: true,
//       importCountry: "italy",
//       sellerType: "dealer",
//       owners: 1,
//       condition: "new",
//       vin: "",
//     },
//     {
//       userId: "demo-user",
//       brand: "Tesla",
//       model: "Model 3",
//       title: "Tesla Model 3 Long Range",
//       description:
//         "Elektromobil s velkým dojezdem. Autopilot, premium audio systém.",
//       price: "1125000",
//       year: 2022,
//       mileage: 35000,
//       fuelType: ["electric"],
//       transmission: ["automatic"],
//       bodyType: "sedan",
//       color: "white",
//       driveType: ["awd"],
//       engineVolume: null,
//       power: 462,
//       doors: 4,
//       seats: 5,
//       region: "prague",
//       category: "used",
//       vehicleType: "osobni-auta",
//       isTopListing: false,
//       vatDeductible: true,
//       isImported: true,
//       importCountry: "usa",
//       sellerType: "private",
//       owners: 1,
//       condition: "used",
//       vin: "",
//     },
//     {
//       userId: "demo-user",
//       brand: "Škoda",
//       model: "Fabia",
//       title: "Škoda Fabia 1.0 TSI",
//       description:
//         "Praktický hatchback, ekonomický provoz. Klimatizace, el. okna.",
//       price: "462500",
//       year: 2021,
//       mileage: 52000,
//       fuelType: ["benzin"],
//       transmission: ["manual"],
//       bodyType: "hatchback",
//       color: "red",
//       driveType: ["fwd"],
//       engineVolume: "1.0",
//       power: 95,
//       doors: 5,
//       seats: 5,
//       region: "plzen",
//       category: "used",
//       vehicleType: "osobni-auta",
//       isTopListing: false,
//       vatDeductible: false,
//       isImported: false,
//       importCountry: null,
//       sellerType: "private",
//       owners: 2,
//       condition: "used",
//       vin: "",
//     },
//     {
//       userId: "demo-user",
//       brand: "Ford",
//       model: "Ranger",
//       title: "Ford Ranger Raptor",
//       description: "Terénní pickup s výkonným motorem. Ideální pro dobrodruhy.",
//       price: "1300000",
//       year: 2024,
//       mileage: 2000,
//       fuelType: ["diesel"],
//       transmission: ["automatic"],
//       bodyType: "pickup",
//       color: "orange",
//       driveType: ["4wd"],
//       engineVolume: "3.0",
//       power: 213,
//       doors: 4,
//       seats: 5,
//       region: "liberec",
//       category: "new",
//       vehicleType: "nakladni-vozy",
//       isTopListing: false,
//       vatDeductible: true,
//       isImported: false,
//       importCountry: null,
//       sellerType: "dealer",
//       owners: 1,
//       condition: "new",
//       vin: "",
//     },
//   ];

//   for (const listing of demoListings) {
//     await storage.createListing(listing);
//   }

//   log("Initialized 6 demo listings");
// }

// /* --------------------------------- start -------------------------------- */

// (async () => {
//   // Seed admin user and demo listings on startup
//   await seedAdminUser();
//   await seedDemoListings();

//   // API routes
//   const server = await registerRoutes(app);

//   /**
//    * ✅ OG/Preview for messengers on listing pages
//    * ВАЖЛИВО:
//    * - У DEV (Vite) НЕ читаємо dist/index.html → просто next()
//    * - У PROD: якщо не бот → next() (serveStatic віддасть SPA)
//    * - У PROD: якщо бот → повертаємо HTML з підміненою OG/Twitter інформацією
//    */
//   app.get("/listing/:id", async (req, res, next) => {
//     try {
//       res.set("Vary", "User-Agent");
//       const ua = req.get("user-agent") || "";

//       // DEV: Vite middleware сам віддасть index.html
//       if (app.get("env") === "development") return next();

//       // Не бот — нехай SPA відпрацює стандартно
//       if (!BOT_UA.test(ua)) return next();

//       const listing = await storage.getListing(req.params.id);
//       const baseHtml = readIndexHtml();

//       // Якщо нема оголошення — віддай дефолтний index.html
//       if (!listing) {
//         res.set("Cache-Control", "no-store");
//         return res.status(200).type("html").send(baseHtml);
//       }

//       const photos = Array.isArray((listing as any).photos)
//         ? (listing as any).photos
//         : [];
//       const firstPhoto = photos
//         .filter((p: any) => typeof p === "string" && p.trim() !== "")
//         .map((p: string) => normalizeKey(p))[0];

//       const ogImage = firstPhoto
//         ? `${BASE_URL}/objects/${firstPhoto}`
//         : `${BASE_URL}/og-image.png`;

//       const price = Number((listing as any).price || 0).toLocaleString("cs-CZ");
//       const brand = (listing as any).brand || "";
//       const model = (listing as any).model || "";
//       const year = (listing as any).year || "";

//       const ogTitle = `${year} ${brand} ${model} - ${price} Kč | NNAuto`;

//       const ogDescRaw =
//         ((listing as any).description || "").toString().trim() ||
//         `Prodej ${year} ${brand} ${model}.`;
//       const ogDesc = ogDescRaw.slice(0, 180);

//       const canonical = `${BASE_URL}/listing/${(listing as any).id || req.params.id}`;

//       const html = injectListingOG(baseHtml, {
//         title: ogTitle,
//         description: ogDesc,
//         image: ogImage,
//         url: canonical,
//       });

//       res.set("Cache-Control", "no-store");
//       return res.status(200).type("html").send(html);
//     } catch (e) {
//       next(e);
//     }
//   });

//   // Vite in development, static in production
//   // (важливо викликати після всіх роутів, щоб catch-all не заважав)
//   if (app.get("env") === "development") {
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }

//   // Global error handler (в кінці)
//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";
//     res.status(status).json({ message });
//     // якщо хочеш не крешити процес — прибери throw
//     throw err;
//   });

//   const port = parseInt(process.env.PORT || "5000", 10);

//   server.listen(
//     {
//       port,
//       host: "0.0.0.0",
//       reusePort: true,
//     },
//     () => {
//       log(`serving on port ${port}`);
//     },
//   );
// })();
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import compression from "compression";
import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "fs";
import path from "path";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.disable("x-powered-by");

// ВАЖЛИВО: BASE_URL має бути саме тим доменом, який ти шериш у месенджерах
const BASE_URL = process.env.BASE_URL || "https://nnauto.cz";
const SITE_NAME = "NNAuto";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

// ---------- helpers ----------
function escapeAttr(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeKey(p: string) {
  return p.replace(/^\/+/, "").trim();
}

const INDEX_CANDIDATES = [
  // prod (типовий для шаблону)
  path.join(process.cwd(), "dist", "public", "index.html"),
  // альтернативи
  path.join(process.cwd(), "dist", "index.html"),
  path.join(process.cwd(), "public", "index.html"),
  path.join(process.cwd(), "client", "dist", "index.html"),
  // dev (Vite root)
  path.join(process.cwd(), "index.html"),
];

function readIndexHtml() {
  for (const p of INDEX_CANDIDATES) {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
  }
  throw new Error(
    `index.html not found. Tried:\n${INDEX_CANDIDATES.join("\n")}`,
  );
}

function upsertTag(html: string, rx: RegExp, tag: string) {
  if (rx.test(html)) return html.replace(rx, tag);
  // якщо нема — вставляємо перед </head>
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function injectListingOG(
  html: string,
  meta: { title: string; description: string; image: string; url: string },
) {
  const t = escapeAttr(meta.title);
  const d = escapeAttr(meta.description);
  const img = escapeAttr(meta.image);
  const url = escapeAttr(meta.url);

  let out = html;

  // title
  if (/<title>[\s\S]*?<\/title>/i.test(out)) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
  } else {
    out = out.replace(/<\/head>/i, `  <title>${t}</title>\n</head>`);
  }

  // canonical
  out = upsertTag(
    out,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${url}" />`,
  );

  // description
  out = upsertTag(
    out,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${d}" />`,
  );

  // OG базові
  out = upsertTag(
    out,
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="product" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${url}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${t}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${d}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${img}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:secure_url" content="${img}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="${t}" />`,
  );

  // Twitter
  out = upsertTag(
    out,
    /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:url" content="${url}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${t}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${d}" />`,
  );
  out = upsertTag(
    out,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${img}" />`,
  );

  return out;
}

// ---------- middleware ----------
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
);

// caching headers for static-ish assets
app.use((req, res, next) => {
  const p = req.path;

  // hashed assets
  if (p.match(/[-\.][a-f0-9]{8,}\.(js|css)$/i) || p.startsWith("/assets/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  // objects (часто без розширення, але це картинки/відео)
  else if (p.startsWith("/objects/")) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
  }
  // images by extension
  else if (p.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
  }
  // fonts
  else if (p.match(/\.(woff2?|ttf|eot|otf)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  // favicon
  else if (p === "/favicon.ico") {
    res.setHeader("Cache-Control", "public, max-age=604800");
  }

  next();
});

// seed admin user
async function seedAdminUser() {
  const adminEmail = "admin@zlateauto.cz";
  const existingAdmin = await storage.getUserByEmail(adminEmail);

  if (existingAdmin) {
    log("Admin user already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await storage.createUser({
    email: adminEmail,
    username: "admin",
    password: hashedPassword,
    firstName: "Admin",
    lastName: "User",
    isAdmin: true,
  });

  log("Created admin user: admin@zlateauto.cz / admin123");
}

// seed demo listings
async function seedDemoListings() {
  const existingListings = await storage.getListings();
  if (existingListings.length > 0) {
    log(`Skipping seed - found ${existingListings.length} existing listings`);
    return;
  }

  const demoListings = [
    {
      userId: "demo-user",
      brand: "Toyota",
      model: "Camry",
      title: "Toyota Camry 2.5 Hybrid",
      description:
        "Velmi pěkný hybrid v perfektním stavu. Pravidelný servis, garáž.",
      price: "637500",
      year: 2021,
      mileage: 45000,
      fuelType: ["hybrid"],
      transmission: ["automatic"],
      bodyType: "sedan",
      color: "silver",
      driveType: ["fwd"],
      engineVolume: "2.5",
      power: 218,
      doors: 4,
      seats: 5,
      region: "prague",
      category: "used",
      vehicleType: "osobni-auta",
      isTopListing: false,
      vatDeductible: true,
      isImported: false,
      importCountry: null,
      sellerType: "private",
      owners: 1,
      condition: "used",
      vin: "",
    },
    {
      userId: "demo-user",
      brand: "BMW",
      model: "X5",
      title: "BMW X5 xDrive40i",
      description:
        "Luxusní SUV s kompletní výbavou. Kůže, pano výbava, navigace.",
      price: "1472500",
      year: 2022,
      mileage: 28000,
      fuelType: ["benzin"],
      transmission: ["automatic"],
      bodyType: "suv",
      color: "black",
      driveType: ["awd"],
      engineVolume: "3.0",
      power: 340,
      doors: 5,
      seats: 7,
      region: "brno",
      category: "used",
      vehicleType: "osobni-auta",
      isTopListing: true,
      vatDeductible: true,
      isImported: true,
      importCountry: "germany",
      sellerType: "dealer",
      owners: 2,
      condition: "used",
      vin: "",
    },
    {
      userId: "demo-user",
      brand: "Audi",
      model: "RS5",
      title: "Audi RS5 Sportback",
      description:
        "Sportovní sedan s fantastickým výkonem. Carbon doplňky, sportovní výfuk.",
      price: "1800000",
      year: 2024,
      mileage: 5000,
      fuelType: ["benzin"],
      transmission: ["automatic"],
      bodyType: "sedan",
      color: "blue",
      driveType: ["awd"],
      engineVolume: "2.9",
      power: 450,
      doors: 5,
      seats: 5,
      region: "ostrava",
      category: "new",
      vehicleType: "osobni-auta",
      isTopListing: true,
      vatDeductible: true,
      isImported: true,
      importCountry: "italy",
      sellerType: "dealer",
      owners: 1,
      condition: "new",
      vin: "",
    },
    {
      userId: "demo-user",
      brand: "Tesla",
      model: "Model 3",
      title: "Tesla Model 3 Long Range",
      description:
        "Elektromobil s velkým dojezdem. Autopilot, premium audio systém.",
      price: "1125000",
      year: 2022,
      mileage: 35000,
      fuelType: ["electric"],
      transmission: ["automatic"],
      bodyType: "sedan",
      color: "white",
      driveType: ["awd"],
      engineVolume: null,
      power: 462,
      doors: 4,
      seats: 5,
      region: "prague",
      category: "used",
      vehicleType: "osobni-auta",
      isTopListing: false,
      vatDeductible: true,
      isImported: true,
      importCountry: "usa",
      sellerType: "private",
      owners: 1,
      condition: "used",
      vin: "",
    },
    {
      userId: "demo-user",
      brand: "Škoda",
      model: "Fabia",
      title: "Škoda Fabia 1.0 TSI",
      description:
        "Praktický hatchback, ekonomický provoz. Klimatizace, el. okna.",
      price: "462500",
      year: 2021,
      mileage: 52000,
      fuelType: ["benzin"],
      transmission: ["manual"],
      bodyType: "hatchback",
      color: "red",
      driveType: ["fwd"],
      engineVolume: "1.0",
      power: 95,
      doors: 5,
      seats: 5,
      region: "plzen",
      category: "used",
      vehicleType: "osobni-auta",
      isTopListing: false,
      vatDeductible: false,
      isImported: false,
      importCountry: null,
      sellerType: "private",
      owners: 2,
      condition: "used",
      vin: "",
    },
    {
      userId: "demo-user",
      brand: "Ford",
      model: "Ranger",
      title: "Ford Ranger Raptor",
      description: "Terénní pickup s výkonným motorem. Ideální pro dobrodruhy.",
      price: "1300000",
      year: 2024,
      mileage: 2000,
      fuelType: ["diesel"],
      transmission: ["automatic"],
      bodyType: "pickup",
      color: "orange",
      driveType: ["4wd"],
      engineVolume: "3.0",
      power: 213,
      doors: 4,
      seats: 5,
      region: "liberec",
      category: "new",
      vehicleType: "nakladni-vozy",
      isTopListing: false,
      vatDeductible: true,
      isImported: false,
      importCountry: null,
      sellerType: "dealer",
      owners: 1,
      condition: "new",
      vin: "",
    },
  ];

  for (const listing of demoListings) {
    await storage.createListing(listing as any);
  }

  log("Initialized 6 demo listings");
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Skip body parsing for video upload routes (handled by multer)
const skipBodyParserFor = (req: Request) => {
  return (
    req.path === "/api/objects/upload-video" ||
    req.headers["content-type"]?.includes("multipart/form-data") === true
  );
};

app.use((req, res, next) => {
  if (skipBodyParserFor(req)) return next();

  express.json({
    limit: "1500mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })(req, res, next);
});

app.use((req, res, next) => {
  if (skipBodyParserFor(req)) return next();
  express.urlencoded({ extended: false, limit: "1500mb" })(req, res, next);
});

// simple api log
app.use((req, res, next) => {
  const start = Date.now();
  const p = req.path;

  res.on("finish", () => {
    if (!p.startsWith("/api")) return;
    const duration = Date.now() - start;
    log(`${req.method} ${p} ${res.statusCode} in ${duration}ms`);
  });

  next();
});

// ---------- bootstrap ----------
(async function bootstrap() {
  await seedAdminUser();
  await seedDemoListings();

  const server = await registerRoutes(app);

  // ✅ OG/Preview for listing pages (важливо: ДО setupVite/serveStatic)
  app.get("/listing/:id", async (req, res, next) => {
    try {
      res.set("Vary", "User-Agent");

      const id = req.params.id;
      const baseHtml = readIndexHtml();

      const listing = await storage.getListing(id);

      // якщо нема оголошення — віддай дефолтний index.html
      if (!listing) {
        res.set("Cache-Control", "no-store");
        return res.status(200).type("html").send(baseHtml);
      }

      // photos можуть бути ключами або повними URL
      const rawPhotos =
        (listing as any).photos ??
        (listing as any).images ??
        (listing as any).photoUrls ??
        [];
      const photos: string[] = Array.isArray(rawPhotos) ? rawPhotos : [];

      const first = photos.find(
        (p) => typeof p === "string" && p.trim() !== "",
      );
      let ogImage = DEFAULT_OG_IMAGE;

      if (first) {
        const p = first.trim();
        if (/^https?:\/\//i.test(p)) {
          ogImage = p;
        } else {
          ogImage = `${BASE_URL}/objects/${normalizeKey(p)}`;
        }
      }

      const priceNum = Number((listing as any).price || 0);
      const price = Number.isFinite(priceNum)
        ? priceNum.toLocaleString("cs-CZ")
        : "";

      const brand = (listing as any).brand || "";
      const model = (listing as any).model || "";
      const year = (listing as any).year || "";

      const ogTitle = `${year} ${brand} ${model} - ${price} Kč | ${SITE_NAME}`;

      const ogDescRaw =
        ((listing as any).description || "").toString().trim() ||
        `Prodej ${year} ${brand} ${model}.`;

      const ogDesc = ogDescRaw.slice(0, 180);
      const canonical = `${BASE_URL}/listing/${(listing as any).id || id}`;

      const html = injectListingOG(baseHtml, {
        title: ogTitle,
        description: ogDesc,
        image: ogImage,
        url: canonical,
      });

      res.set("Cache-Control", "no-store");
      return res.status(200).type("html").send(html);
    } catch (e) {
      next(e);
    }
  });

  // error handler (після всіх роутів)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Vite only in dev
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => log(`serving on port ${port}`),
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
