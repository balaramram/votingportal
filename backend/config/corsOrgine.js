const whiteList = [
  "https://votingportal-opal.vercel.app/",
  "http://localhost:5173",
  "http://localhost:5174",
  "null",
  "http://localhost:5175"
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
