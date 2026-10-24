// backend/notifications/sendEmailWorker/index.js
// Worker xử lý message từ hàng đợi nội bộ (common/queue.js) để gửi email qua SMTP.
// Ném lỗi khi gửi thất bại để hàng đợi tự retry.
import { sendEmail, FROM_EMAIL } from '../../common/mailer.js'
import { table, TABLE } from '../../common/db.js'
import config from '../../common/config.js'

const loginUrl = () => `${config.publicUrl || `http://localhost:${config.port}`}/login`

export async function processMessage(message) {
  console.log('Processing message:', message.type)

  switch (message.type) {
    case 'STUDENT_CREATED': {
      const s = message.student
      console.log(`Sending welcome email to: ${s.email}`)
      await sendEmail(
        s.email,
        'Chào mừng đến với Student Portal',
        `Xin chào ${s.fullName}, bạn đã được thêm vào hệ thống với mã ${s.studentId}.`
      )
      return { studentId: s.studentId, status: 'sent' }
    }

    case 'TEACHER_CREATED': {
      const t = message.teacher
      console.log(`Sending welcome email to: ${t.email}`)
      await sendEmail(
        t.email,
        'Chào mừng giảng viên đến với Student Portal',
        `Xin chào ${t.fullName}, bạn đã được thêm vào hệ thống với mã giảng viên ${t.teacherId} (khoa ${t.department}).`
      )
      return { teacherId: t.teacherId, status: 'sent' }
    }

    case 'DOCUMENT_UPLOADED': {
      const d = message.document
      console.log(`Sending document notification to: ${FROM_EMAIL}`)
      await sendEmail(
        FROM_EMAIL,
        'Tài liệu mới được upload',
        `Sinh viên ${d.studentId} vừa upload tài liệu: ${d.fileName} (${d.s3Key}).`
      )
      return { documentId: d.id, status: 'sent' }
    }

    case 'GRADE_POSTED': {
      const g = message.grade
      const student = table(TABLE.STUDENTS).get(g.studentId)
      if (!student?.email) {
        console.warn(`Không tìm thấy email sinh viên ${g.studentId}, bỏ qua thông báo điểm.`)
        return { gradeId: g.id, status: 'skipped' }
      }
      console.log(`Sending grade notification to: ${student.email}`)
      await sendEmail(
        student.email,
        `Điểm môn ${g.subject} đã được công bố`,
        `Xin chào ${student.fullName}, điểm môn ${g.subject}${g.semester ? ` (học kỳ ${g.semester})` : ''} của bạn là ${g.score}.`
      )
      return { gradeId: g.id, status: 'sent' }
    }

    case 'MATERIAL_UPLOADED': {
      const m = message.material
      console.log(`Sending material notification to: ${FROM_EMAIL}`)
      await sendEmail(
        FROM_EMAIL,
        'Tài liệu học tập mới',
        `Tài liệu "${m.title}" môn ${m.subject} (${m.type}) vừa được tải lên: ${m.fileName}.`
      )
      return { materialId: m.id, status: 'sent' }
    }

    case 'USER_CREATED': {
      const { email, temporaryPassword, role } = message
      console.log(`Sending account invitation to: ${email}`)
      await sendEmail(
        email,
        'Tài khoản Student Portal của bạn',
        `Tài khoản (${role}) đã được tạo cho bạn.\n\nEmail: ${email}\nMật khẩu tạm: ${temporaryPassword}\n\n` +
        `Đăng nhập tại ${loginUrl()} — bạn sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.`
      )
      return { email, status: 'sent' }
    }

    case 'PASSWORD_RESET': {
      const { email, code } = message
      console.log(`Sending password reset code to: ${email}`)
      await sendEmail(
        email,
        'Mã xác nhận đặt lại mật khẩu',
        `Mã xác nhận của bạn là: ${code}\nMã có hiệu lực trong 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`
      )
      return { email, status: 'sent' }
    }

    default:
      console.log(`Không hỗ trợ message type: ${message.type}`)
      return { message: `Không hỗ trợ: ${message.type}`, status: 'skipped' }
  }
}

export default processMessage
