const whiteList = [
  "http://localhost:5173",
  "http://localhost:5174",
  "null",
  "http://localhost:5175",
  "https://votingportal-jecnup7fs-balaram1327r-4620s-projects.vercel.app",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or Postman)
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "organizationname",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600, 
};
