const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const dashboardSchema = new mongoose.Schema({
  subject: String,
  total: String,
  present: String,
  absent: String,
  bioPresent: String,
  bioAbsent: String,
  percentage: String
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  subject: String,
  total: String,
  present: String,
  absent: String,
  percentage: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  username: { type: String, unique: true },
  password: { type: String, select: false },
  studentName: { type: String, default: "" },
  regInfo: { type: String, default: "" },
  dashboard: [dashboardSchema],
  attendance: [attendanceSchema]
});

const User = mongoose.model("User", userSchema);



// Simple College Scraping Function Using Axios and CookieJar
async function scrapeCollegeAttendance(user, type) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ 
    jar, 
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive'
    }
  }));

  try {
    // 1. Fetch Login Page to get CSRF token
    const baseUrl = "https://adamasknowledgecity.ac.in/student/";
    const loginPageResp = await client.get(baseUrl + "login");
    const $login = cheerio.load(loginPageResp.data);
    const _token = $login('input[name="_token"]').val();

    // 2. Perform Login POST
    await client.post(baseUrl + "login", {
      _token,
      registration_no: user.username,
      password: user.password,
      login: "login"
    }, {
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": baseUrl + "login"
      }
    });

    // 3. Fetch Dashbaord or Attendance page based on request
    const targetUrl = type === "dashboard" ? baseUrl + "dashboard" : baseUrl + "attendance";
    const targetResp = await client.get(targetUrl);
    const $ = cheerio.load(targetResp.data);

    let studentName = user.studentName;
    let regInfo = user.regInfo;

    // The student name info is only present in the dashboard page HTML
    if (type === "dashboard") {
      const studentNameRaw = $('#greetingMessage').next('h3').text();
      studentName = studentNameRaw.replace(/\s+/g, ' ').trim();

      const regInfoRaw = $('#greetingMessage').siblings('p').text();
      regInfo = regInfoRaw.replace(/\s+/g, ' ').trim();
      
      // Update DB if found so the Attendance page can use it later
      if (studentName || regInfo) {
        user.studentName = studentName;
        user.regInfo = regInfo;
      }
    }

    let attendanceData = {
      type,
      studentName: studentName || "Unknown Student",
      regInfo: regInfo || "No registration found",
      results: []
    };

    // Example actual parsing logic for dashboard
    if (type === "dashboard") {
      // Find each subject row
      $('tr.clickable-subject-row').each((i, el) => {
          // Extract the subject name, which is inside a nested div structure
          const rawSubject = $(el).find('td').eq(0).text();
          // The raw text includes "Click for details", so we clean it up
          const subject = rawSubject.replace('Click for details', '').replace(/\s+/g, ' ').trim();
          
          const total = $(el).find('td').eq(1).text().trim();
          const present = $(el).find('td').eq(2).text().trim();
          const absent = $(el).find('td').eq(3).text().trim();
          const leave = $(el).find('td').eq(4).text().trim();
          const bioPresentRow = $(el).find('td').eq(5).text().trim();
          const bioAbsentRow = $(el).find('td').eq(6).text().trim();
          const markedAbsent = $(el).find('td').eq(7).text().trim();
          const effective = $(el).find('td').eq(8).text().trim();
          const percentage = $(el).find('td').eq(9).text().trim();

          // Extract daily records from the immediate sibling row
          const details = [];
          const detailsRow = $(el).next('tr.attendance-details-row');
          if (detailsRow.length) {
            // Find all standard rows in the details table (ignoring legend rows which don't have expected structured data)
            detailsRow.find('tbody tr').each((j, detailEl) => {
              const dateText = $(detailEl).find('td').eq(0).text().replace(/\s+/g, ' ').trim();
              const timeText = $(detailEl).find('td').eq(1).text().replace(/\s+/g, ' ').trim();
              const facultyText = $(detailEl).find('td').eq(2).text().replace(/\s+/g, ' ').trim();

              // Validate this is a true record row (dates will exist, legend tables won't have standard time text)
              if (dateText && timeText && dateText.length > 5 && timeText.includes('-')) {
                const classStatusTd = $(detailEl).find('td').eq(3);
                const bioStatusTd = $(detailEl).find('td').eq(4);
                const finalStatusTd = $(detailEl).find('td').eq(5);

                const classPresent = classStatusTd.find('.fa-check').length > 0;
                const classAbsent = classStatusTd.find('.fa-times').length > 0;
                
                const bioPresentStat = bioStatusTd.find('.fa-check').length > 0;
                const bioAbsentStat = bioStatusTd.find('.fa-times').length > 0;

                const finalPresent = finalStatusTd.find('.fa-check').length > 0;
                const finalAbsent = finalStatusTd.find('.fa-times').length > 0;
                const finalWarning = finalStatusTd.find('.fa-exclamation').length > 0;

                const btn = $(detailEl).find('button.refresh-attendance-btn');
                let refreshData = null;
                if (btn.length) {
                  refreshData = {
                    date: btn.attr('data-date'),
                    headerId: btn.attr('data-attendanceheaderid')
                  };
                }

                details.push({
                  date: dateText,
                  time: timeText,
                  faculty: facultyText,
                  status: {
                    classStatus: classPresent ? 'present' : (classAbsent ? 'absent' : 'unknown'),
                    bioStatus: bioPresentStat ? 'present' : (bioAbsentStat ? 'absent' : 'unknown'),
                    finalStatus: finalPresent ? 'present' : (finalAbsent ? 'absent' : (finalWarning ? 'warning' : 'unknown'))
                  },
                  refreshData
                });
              }
            });
          }

          attendanceData.results.push({ 
            subject, 
            total,
            present,
            absent,
            leave,
            bioPresent: bioPresentRow,
            bioAbsent: bioAbsentRow,
            markedAbsent,
            effective,
            percentage,
            details
          });
      });
    } else {
      // class attendance only logic
      $('#myTable tbody tr').each((i, el) => {
          const subject = $(el).find('td').eq(0).text().replace('&nbsp;', '').trim();
          const total = $(el).find('td').eq(1).text().trim();
          const present = $(el).find('td').eq(2).text().trim();
          const absent = $(el).find('td').eq(3).text().trim();
          const percentage = $(el).find('td').eq(4).text().trim();

          if (subject) {
            attendanceData.results.push({ 
              subject, 
              total,
              present,
              absent,
              percentage 
            });
          }
      });
    }
    
    // Save scraped data to DB
    if (type === "dashboard") {
      user.dashboard = attendanceData.results.map(res => ({
        subject: res.subject,
        total: res.total,
        present: res.present,
        absent: res.absent,
        bioPresent: res.bioPresent,
        bioAbsent: res.bioAbsent,
        percentage: res.percentage
      }));
    } else if (type === "attendance") {
      user.attendance = attendanceData.results.map(res => ({
        subject: res.subject,
        total: res.total,
        present: res.present,
        absent: res.absent,
        percentage: res.percentage
      }));
    }
    await user.save();

    return { success: true, data: attendanceData };
    
  } catch (error) {
    console.error("Scraping error:", error);
    return { success: false, message: "Failed to scrape attendance" };
  }
}

// Routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name || null,
      username: u.username,
      studentName: u.studentName || "Guest User"
    }));
    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/auth", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json({ success: true, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/attendance/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query; // 'dashboard' or 'attendance'

  if (type !== 'dashboard' && type !== 'attendance') {
    return res.status(400).json({ message: "Invalid type requested" });
  }

  try {
    const user = await User.findOne({ id: userId }).select('+password');
    if (!user) return res.status(404).json({ message: "User not found" });

    const scrapeResult = await scrapeCollegeAttendance(user, type);
    res.json(scrapeResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
