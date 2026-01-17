require('dotenv').config()
const express = require("express");
const { connectingToDatabase } = require('../config/database');
const app = express();

const cors = require('cors')
const errorHandler = require('../middleware/errorHandler');
app.options("*", cors());
const path = require('path');
const { Context, JoonWebAPI, Helper } = require('@joonweb/joonweb-sdk')
const session = require('express-session');
const verifyHmac = require("../utils/joonwebHelper");
const sendResponse = require("../utils/sendResponse")

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: "*",
}));

app.options("*", cors());

// routes import
const bunnyRoutes = require("../routes/bunny_route")
const authRoutes = require("../routes/auth_routes")
const mediaRoutes = require("../routes/media_routes")
const widgetsRoutes = require("../routes/widgets_routes");
const mediaEvents = require("../controllers/events/mediaEvents")

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// database
connectingToDatabase()

Context.init({
  api_key: process.env.JOONWEB_CLIENT_ID,
  api_secret: process.env.JOONWEB_CLIENT_SECRET,
  api_version: process.env.JOONWEB_API_VERSION || '26.0',
  is_embedded: true,

  session_storage_type: 'mongodb',
  session_storage_options: {

    url: process.env.MONGODB_URI,
    dbName: 'reel_plugin_app2629'
  }
});

const sessionManager = Context.getSessionStorage();
app.set('trust proxy', 1);

app.use(session({
  secret: process.env.JOONWEB_CLIENT_SECRET || 'joonweb-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.get('/extensions/reels-section/assets/reels-section.js', (req, res) => {
  
  // 1. Define the physical path to the file on your computer
  // (Make sure the file is actually inside an 'assets' folder now, as per your path below)
  const filePath = path.join(__dirname, '../extensions/reels-section/assets/reels-section.js');

  // 2. Explicitly set the header to prevent CORB/ORB blocking
  res.setHeader('Content-Type', 'application/javascript');

  // 3. Send the file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ File sending error:", err);
      // If file is missing, tell the browser 404 (don't send HTML!)
      res.status(404).send("File not found");
    }
  });
});

// health check of backend
app.get("/healthCheck", (req, res) => {
  res.send("Backend is running 🚀");
});

//development
// if (process.env.NODE_ENV === 'development') {
//   app.use((req, res, next) => {
//     if (!req.session.site) {
//       console.log("using mock session for dev");
//       req.session.site = "sumit-bhardwaj.myjoonweb.com";
//       req.session.joonweb_user = "test-user";
//     }
//     next();
//   });
// }

// async function checkValidation(req, res, next) {
//   const site = req.session.site
//   if (!site) {
//     return sendResponse.error(res, "UNAUTHORIZED", "No active session found", 401);
//   }

//   try {
//     const accessToken = await sessionManager.getAccessToken(site)

//     if (!accessToken) {
//       return sendResponse.error(res, "UNAUTHORIZED", "Session invalid or expired", 401);
//     }

//     req.accessToken = accessToken
//     req.site = site
    
//     next()
    
//   } catch (error) {
//     return sendResponse.error(res, "AUTH_ERROR", error.message, 500);
//   }

// }

app.get('/', async (req, res) => {
  console.log("App is running..");
  let accessToken = '';
  let api = null;
  let siteInfo = null;

  const sessionManager = Context.getSessionStorage();

  if (req.query.session && req.query.id_token && req.query.site) {
    if (!verifyHmac(req.query)) {
      return res.status(401).send('Invalid HMAC signature');
    }

    const idToken = Helper.decodeSessionToken(req.query.id_token);
    if (idToken) {
      const tokenData = await sessionManager.getSessionData(req.query.site) || null;
      if (tokenData) {
        await sessionManager.startSession(req.query.site, tokenData);
        req.session.joonweb_session = req.query.session;
        req.session.site = req.query.site;
        req.session.joonweb_user = idToken.sub;
      } else {
        return res.status(401).send('Invalid Tokens');
      }
    }
    else {
      return res.status(401).send('Expired Token');
    }
  } else {
    console.log("Not working");
  }

  const site = req.query.site || req.session.site;

  if (!site || !(await sessionManager.isAuthenticated(site))) {
    return res.redirect(`/auth?site=${site}`);
  }
  accessToken = await sessionManager.getAccessToken(site);
  api = new JoonWebAPI(accessToken, site);
  siteInfo = await api.site.get();

  req.siteInfo = siteInfo
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

console.log("Again");

// routes
app.use('/api/v1/bunny', bunnyRoutes)  // for bunny webhook - processing video  
app.use('/auth', authRoutes)

// checkpoint middleware
// app.use(checkValidation)

console.log("Passed Validation");
app.use('/api/v1/media', mediaRoutes)  // image-video creation
app.use('/api/v1/widgets', widgetsRoutes)

app.get('/api/v1/site', async (req, res) => {
  const site = req.session.site;

  if (!site) {
    return res.status(401).json({ error: "No session found" });
  }

  try {
    const accessToken = await sessionManager.getAccessToken(site);
    const api = new JoonWebAPI(accessToken, site);
    const userInfo = req.session.joonweb_user
    siteInfo = await api.site.get();

    return res.json({ userInfo, site });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
console.log("Static Validation");
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// error middleware
app.use(errorHandler)

module.exports = app