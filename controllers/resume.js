const mysql2 = require("mysql2");
const { exec } = require("child_process");

const sql = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Admin@123",
  database: "Resume_",
});

exports.getData = async (req, res, next) => {
  try {
    const id = +req.params.id;
    console.log("requested id is ==>", id);
    if (!Number.isInteger(id))
      return res.json({ status: "Please enter a valid email id" });
    if (Number.isInteger(id)) {
      const query = `SELECT * FROM tbl_cv where emp_id = ${id}`;

      sql.query(query, function (err, results) {
        if (!err) {
          if (results.length == 0)
            return res.status(404).json({
              message: "No data available..! Please check your employee id",
            });
          if (!!results[0].resume_data) {
            let jsonData = JSON.parse(results[0].resume_data);
            results[0].resume_data = jsonData.replace(/\\\n/g, "");
          }
          results[0].image =
            "http://172.16.16.147:3000/images/" + results[0].image;

          console.log("--------->", results[0].resume_data);
          res.status(200).json({
            data: JSON.parse(results[0].resume_data),
            image: results[0].image,
          });
        } else {
          console.log("Error in requesting data", err);
          res.status(400).json({
            message:
              "Something went wrong ..! Please check your employee id and try again ....!",
          });
        }
      });
    } else {
      console.log("No Record Found", err);
      res.status(400).json({ message: "No Record Found" });
    }
  } catch (error) {
    console.log("Error in getting data ====>", error);
    res
      .status(400)
      .json({ Error: "Something went wrong ...! Please try again ...!" });
  }
};

exports.postData = async (req, res, next) => {
  try {
    let imageUrl;
    if (!req.file) {
      return res.json({ message: "Please provide image" });
    } else {
      imageUrl = req.file.filename;
    }
    const { emp_id, emp_email, resume_data } = req.body;
    console.log("resume data=======", resume_data);
    const is_valid = ValidateEmail(emp_email);
    if (!is_valid)
      return res.status(400).json({ Error: "Please enter a valid email" });
    const data = JSON.stringify(resume_data);
    const query =
      "INSERT INTO tbl_cv(emp_id,emp_email,image,resume_data) VALUES ?";
    const value = [[emp_id, emp_email, imageUrl, data]];
    sql.query(query, [value], function (err, results) {
      if (!err) {
        console.log("Results", results);
        return res.status(200).json({
          status: `emp succesfully inserted`,
        });
      } else {
        console.log("error", err);
        return res.status(400).send({ message: "Invalid id" });
      }
    });
  } catch (error) {
    console.log("error", error);
    return res.sendStatus(400).json({ message: "Something went wrong" });
  }
};

exports.header = (req, res, next) => {
  const id = req.params.id;
  if (!id) return res.sendStatus(400).json({ Message: "Enter Id" });

  const query = `SELECT * FROM tbl_cv where emp_id = ${id}`;

  sql.query(query, function (err, results) {
    if (!err) {
      if (results.length == 0)
        return res.json({
          message: "No data available..! Please check your employee id",
        });
      if (!!results[0].resume_data) {
        let jsonData = JSON.parse(results[0].resume_data);
        results[0].resume_data = jsonData.replace(/\\\n/g, "");
      }
      results[0].image = "http://172.16.16.147:3000/images/" + results[0].image;

      const data = JSON.parse(results[0].resume_data);

      res.render("header", {
        data: data,
      });
    } else {
      console.log("Error in requesting data", err);
      res.status(400).json({
        message:
          "Something went wrong ..! Please check your employee id and try again ....!",
      });
    }
  });
};

exports.footer = async (req, res, next) => {
  res.render("footer");
};

function ValidateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  console.log("Error in validation of email");
  return false;
}

const command =
  "wkhtmltopdf --header-html http://172.16.16.147:3000/header/681  --footer-html http://172.16.16.147:3000/footer --header-spacing 10 --margin-top 53 --margin-left 0 --margin-right 0 --no-pdf-compression --page-size A4 --margin-bottom 25  http://172.16.16.147:3000/forpdf/681 '/home/kalpesh/Desktop/mySql_pro/pdf/t11.pdf'";

exports.pdf = async (req, res, next) => {
  const id = req.params.id;
  if (!id) return res.sendStatus(400).json({ Message: "Enter Id" });

  const query = `SELECT * FROM tbl_cv where emp_id = ${id}`;

  sql.query(query, function (err, results) {
    if (!err) {
      if (results.length == 0)
        return res.json({
          message: "No data available..! Please check your employee id",
        });
      if (!!results[0].resume_data) {
        let jsonData = JSON.parse(results[0].resume_data);
        results[0].resume_data = jsonData.replace(/\\\n/g, "");
      }
      results[0].image = "http://172.16.16.147:3000/images/" + results[0].image;

      const data = JSON.parse(results[0].resume_data);
      // cmd(command);
      return res.render("testcopy", {
        data: data,
        image: results[0].image,
      });
    } else {
      console.log("Error in requesting data", err);
      res.status(400).json({
        message:
          "Something went wrong ..! Please check your employee id and try again ....!",
      });
    }
  });
};

exports.generatePdf = async (req, res, next) => {
  cmd(command);
  return res.json("Pdf generation complete");
};

function cmd(cmd, next) {
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

// wkhtmltopdf --header-html http://172.16.16.147:3000/header/681  --footer-html http://172.16.16.147:3000/footer --header-spacing 10 --margin-top 53 --margin-left 0 --margin-right 0 --no-pdf-compression --page-size A4 --margin-bottom 25  http://172.16.16.147:3000/forpdf/681 '/home/kalpesh/Desktop/mySql_pro/pdf/t.pdf'
