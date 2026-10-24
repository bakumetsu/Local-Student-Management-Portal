// seed-all-data.js
// Nạp dữ liệu mẫu vào database SQLite cục bộ (cùng thư mục data/ mà server dùng).
// Chạy: npm run seed   (đặt DATA_DIR nếu server dùng thư mục dữ liệu khác)
import fs from "node:fs";
import path from "node:path";
import { table, TABLE } from "./common/db.js";
import { resolveKey } from "./common/storage.js";
import config from "./common/config.js";

console.log(`🌱 Bắt đầu nạp dữ liệu mẫu vào ${config.dbFile}...`);

const students = [
  {
    id: "SV001",
    studentId: "SV001",
    fullName: "Nguyen Van A",
    email: "nguyenvana@example.com",
    phone: "0909123456",
    gender: "Male",
    dateOfBirth: "2003-05-10",
    major: "Information Technology",
    className: "IT01",
    status: "Active",
    gpa: 3.6,
    createdAt: "2026-07-09T10:00:00Z",
    updatedAt: "2026-07-09T10:00:00Z"
  },
  {
    id: "SV002",
    studentId: "SV002",
    fullName: "Tran Thi B",
    email: "tranthib@example.com",
    phone: "0909123457",
    gender: "Female",
    dateOfBirth: "2002-08-15",
    major: "Computer Science",
    className: "IT01",
    status: "Active",
    gpa: 3.8,
    createdAt: "2026-07-08T14:30:00Z",
    updatedAt: "2026-07-08T14:30:00Z"
  },
  {
    id: "SV003",
    studentId: "SV003",
    fullName: "Le Van C",
    email: "levanc@example.com",
    phone: "0909123458",
    gender: "Male",
    dateOfBirth: "2004-03-20",
    major: "Business Administration",
    className: "SEC01",
    status: "Graduated",
    gpa: 3.2,
    createdAt: "2026-07-07T09:15:00Z",
    updatedAt: "2026-07-07T09:15:00Z"
  },
  {
    id: "SV004",
    studentId: "SV004",
    fullName: "Pham Thi D",
    email: "phamthid@example.com",
    phone: "0909123459",
    gender: "Female",
    dateOfBirth: "2003-11-25",
    major: "Electrical Engineering",
    className: "SEC01",
    status: "Warning",
    gpa: 1.8,
    createdAt: "2026-07-06T16:45:00Z",
    updatedAt: "2026-07-06T16:45:00Z"
  }
];

const teachers = [
  {
    id: "GV001",
    teacherId: "GV001",
    fullName: "Tran Minh Tri",
    email: "teacher1@example.com",
    phone: "0987654321",
    department: "Cloud Computing",
    degree: "PhD",
    subject: "Cybersecurity",
    createdAt: "2026-07-09T08:00:00Z",
    updatedAt: "2026-07-09T08:00:00Z"
  },
  {
    id: "GV002",
    teacherId: "GV002",
    fullName: "Nguyen Thi Mai",
    email: "teacher2@example.com",
    phone: "0987654322",
    department: "Software Engineering",
    degree: "Master",
    subject: "Lập trình Java",
    createdAt: "2026-07-09T08:15:00Z",
    updatedAt: "2026-07-09T08:15:00Z"
  }
];

const grades = [
  {
    id: "grade-1",
    studentId: "SV001",
    teacherId: "GV001",
    subject: "Cybersecurity",
    semester: "2026-1",
    score: 9.0,
    note: "Tích cực tham gia thảo luận lớp học",
    createdAt: "2026-07-10T12:00:00Z"
  },
  {
    id: "grade-2",
    studentId: "SV002",
    teacherId: "GV001",
    subject: "Cybersecurity",
    semester: "2026-1",
    score: 8.5,
    note: "Làm bài thi tốt",
    createdAt: "2026-07-10T12:05:00Z"
  },
  {
    id: "grade-3",
    studentId: "SV001",
    teacherId: "GV002",
    subject: "Lập trình Java",
    semester: "2026-1",
    score: 9.5,
    note: "Kỹ năng code rất tốt",
    createdAt: "2026-07-10T12:10:00Z"
  }
];

const materials = [
  {
    id: "mat-1",
    title: "Giáo trình AWS Cloud Practitioner",
    subject: "Cybersecurity",
    type: "book",
    fileName: "aws_practitioner_guide.pdf",
    s3Key: "materials/IT01/aws_practitioner_guide.pdf",
    createdAt: "2026-07-11T09:00:00Z"
  },
  {
    id: "mat-2",
    title: "Tài liệu Lab Cybersecurity Thực hành",
    subject: "Cybersecurity",
    type: "slide",
    fileName: "lab_cybersecurity_v1.pdf",
    s3Key: "materials/IT01/lab_cybersecurity_v1.pdf",
    createdAt: "2026-07-11T09:30:00Z"
  }
];

const classes = [
  {
    id: "IT01",
    classId: "IT01",
    className: "Công nghệ thông tin 01",
    room: "A101",
    studentCount: 2,
    schedule: "Thứ 2, 4 - 07:30",
    createdAt: "2026-07-09T07:00:00Z",
    updatedAt: "2026-07-09T07:00:00Z"
  },
  {
    id: "SEC01",
    classId: "SEC01",
    className: "An toàn thông tin 01",
    room: "B202",
    studentCount: 2,
    schedule: "Thứ 3, 5 - 13:30",
    createdAt: "2026-07-09T07:00:00Z",
    updatedAt: "2026-07-09T07:00:00Z"
  }
];

// File PDF tối thiểu hợp lệ để link tải tài liệu mẫu hoạt động.
function placeholderPdf(title) {
  const text = title.normalize("NFD").replace(/[^\x20-\x7e]/g, "").replace(/[()\\]/g, "");
  const stream = `BT /F1 18 Tf 72 760 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}

function seedTable(tableName, items) {
  console.log(`⏳ Đang nạp bảng ${tableName}...`);
  const repo = table(tableName);
  for (const item of items) {
    try {
      repo.put(item);
    } catch (err) {
      console.error(`❌ Lỗi khi nạp item vào bảng ${tableName}:`, err.message);
    }
  }
  console.log(`✅ Hoàn tất nạp bảng ${tableName}`);
}

function run() {
  seedTable(TABLE.STUDENTS, students);
  seedTable(TABLE.TEACHERS, teachers);
  seedTable(TABLE.GRADES, grades);
  seedTable(TABLE.CLASSES, classes);
  seedTable(TABLE.MATERIALS, materials.map((m) => ({ ...m, uploadedAt: m.createdAt })));

  // Tạo file mẫu cho tài liệu học tập (nếu chưa có).
  for (const m of materials) {
    const filePath = resolveKey(m.s3Key);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, placeholderPdf(m.title));
    }
  }
  console.log("🎉 Nạp dữ liệu mẫu hoàn tất!");
}

run();
