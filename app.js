const express = require("express");
const bodyParser = require("body-parser");
const CORS = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const resumeRoutes = require("./routes/resume");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();
app.use(CORS());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static("uploads"));
app.options("*", CORS());

app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");
app.set("views", "views");

const PORT = 3000;
app.set("trust proxy", true);
app.all("/*", (req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:3000 http://172.16.18.51:3000"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});
app.use(resumeRoutes);

app.use((error, req, res, next) => {
  console.log("Error", error);
  res
    .status(500)
    .json({ Error: "Invalid Request", message: "Please check your url" });
});

app.listen(PORT, () => {
  console.log(`Running at port ${PORT}`);
});

function ValidateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  alert("You have entered an invalid email address!");
  return false;
}

function cmd(cmd) {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}
// cmd("wkhtmltopdf http://172.16.16.147:3000/getData/681 '/home/kalpesh/Desktop/mySql_pro/te.pdf'")
// cmd("wkhtmltopdf http://172.16.16.147:3000/forpdf '/home/kalpesh/Desktop/mySql_pro/te.pdf'")
// cmd(
//   "wkhtmltopdf http://172.16.16.147:3000/forpdf/681 '/home/kalpesh/Desktop/mySql_pro/pdf/test1.pdf'"
// );

// wkhtmltopdf --header-html http://172.16.16.147:3000/header/681  --footer-html http://172.16.16.147:3000/footer --header-spacing 10 --margin-top 45 --margin-left 0 --margin-right 0  http://172.16.16.147:3000/forpdf/681 '/home/kalpesh/Desktop/mySql_pro/pdf/t.pdf'

// wkhtmltopdf --header-html http://172.16.16.147:3000/header/681  --footer-html http://172.16.16.147:3000/footer --header-spacing 10 --margin-top 53 --margin-left 0 --margin-right 0 --no-pdf-compression --page-size A4 --margin-bottom 25  http://172.16.16.147:3000/forpdf/681 '/home/kalpesh/Desktop/mySql_pro/pdf/t.pdf'

// wkhtmltopdf --header-html http://172.16.16.147:3000/header/681  --footer-html http://172.16.16.147:3000/footer --header-spacing 10 --margin-top 53 --margin-left 0 --margin-right 0 --no-pdf-compression --page-size A4 --margin-bottom 25  http://172.16.16.147:3000/forpdf/681 '/home/kalpesh/Desktop/mySql_pro/pdf/t.pdf'

// wkhtmltopdf --header-html http://172.16.16.147:3000/header/422  --footer-html http://172.16.16.147:3000/footer --header-spacing 10 --margin-top 53 --margin-left 0 --margin-right 0 --no-pdf-compression --page-size A4 --margin-bottom 25  http://172.16.16.147:3000/forpdf/422 '/home/kalpesh/Desktop/ResumeMaking/pdf/422.pdf'
