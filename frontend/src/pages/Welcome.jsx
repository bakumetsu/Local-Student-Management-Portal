import { Link } from 'react-router-dom'
import { GraduationCap, ArrowRight, Shield, Award, BookOpen } from 'lucide-react'

export default function Welcome() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      color: 'rgba(0, 0, 0, 0.88)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(#e6f4ff 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      {/* Decorative colored blur balls */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(22, 119, 255, 0.08)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        top: '10%',
        right: '5%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(82, 196, 26, 0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        bottom: '10%',
        left: '5%',
        pointerEvents: 'none'
      }} />

      {/* Welcome Card Container (Ant Design Card Style) */}
      <div style={{
        maxWidth: '760px',
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
        zIndex: 1,
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* AntD-like icon header */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '8px',
          backgroundColor: '#e6f4ff',
          color: '#1677ff',
          marginBottom: '24px'
        }}>
          <GraduationCap size={40} />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'rgba(0, 0, 0, 0.88)',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
          lineHeight: '1.25'
        }}>
          Student Management Portal
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.1rem',
          color: 'rgba(0, 0, 0, 0.45)',
          maxWidth: '580px',
          margin: '0 auto 36px',
          lineHeight: '1.57'
        }}>
          Hệ thống quản lý học vụ chuẩn doanh nghiệp, tự vận hành hoàn toàn trên máy chủ của bạn. Đơn giản, an toàn và tối ưu hiệu suất.
        </p>

        {/* AntD style Feature Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          <div style={{
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            padding: '16px 20px',
            borderRadius: '8px'
          }}>
            <Shield size={20} style={{ color: '#1677ff', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.88)' }}>Bảo mật</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', lineHeight: '1.5' }}>Xác thực JWT, mật khẩu băm scrypt và phân quyền theo vai trò.</p>
          </div>
          <div style={{
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            padding: '16px 20px',
            borderRadius: '8px'
          }}>
            <Award size={20} style={{ color: '#52c41a', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.88)' }}>Quản lý học vụ</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', lineHeight: '1.5' }}>Xem lớp, nhập điểm số, quản lý hồ sơ sinh viên tập trung.</p>
          </div>
          <div style={{
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            padding: '16px 20px',
            borderRadius: '8px'
          }}>
            <BookOpen size={20} style={{ color: '#faad14', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.88)' }}>Tài nguyên số</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', lineHeight: '1.5' }}>Lưu trữ giáo trình và bài tập an toàn với link tải có chữ ký.</p>
          </div>
        </div>

        {/* AntD-like Button */}
        <div>
          <Link to="/login" className="btn btn-primary" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: '500',
            borderRadius: '6px',
            textDecoration: 'none',
            backgroundColor: '#1677ff',
            color: '#ffffff',
            boxShadow: '0 2px 0 rgba(5, 145, 255, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4096ff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1677ff'}
          >
            Đăng nhập hệ thống <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Footer copyright */}
      <div style={{
        marginTop: '24px',
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1
      }}>
        &copy; {new Date().getFullYear()} Student Portal. Powered by Ant Design Style.
      </div>
    </div>
  )
}
