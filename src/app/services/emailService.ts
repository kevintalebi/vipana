import * as nodemailer from 'nodemailer';

// Email service configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailConfirmationData {
  email: string;
  confirmationToken: string;
  role: string;
}

export const sendConfirmationEmail = async (data: EmailConfirmationData): Promise<boolean> => {
  try {
    console.log('Starting email confirmation process...');
    console.log('SMTP Configuration check:', {
      host: process.env.SMTP_HOST ? 'Set' : 'Missing',
      user: process.env.SMTP_USER ? 'Set' : 'Missing',
      pass: process.env.SMTP_PASS ? 'Set' : 'Missing',
      port: process.env.SMTP_PORT || '587',
      secure: process.env.SMTP_SECURE || 'false'
    });

    // Validate required environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration:', {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS
      });
      return false;
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error('Missing NEXT_PUBLIC_SITE_URL environment variable');
      return false;
    }

    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token=${data.confirmationToken}&email=${encodeURIComponent(data.email)}`;
    
    // Test SMTP connection
    try {
      console.log('Testing SMTP connection...');
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP connection failed:', verifyError);
      if (verifyError instanceof Error) {
        console.error('SMTP Error details:', verifyError.message);
        console.error('SMTP Error stack:', verifyError.stack);
      }
      return false;
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.email,
      subject: 'تایید ایمیل - ویپانا',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">ویپانا</h1>
            
            <h2 style="color: #333; margin-bottom: 20px;">تایید حساب کاربری</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              سلام! برای تکمیل ثبت نام در ویپانا، لطفاً ایمیل خود را تایید کنید.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                تایید ایمیل
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              اگر دکمه بالا کار نمی‌کند، می‌توانید این لینک را در مرورگر خود کپی کنید:
            </p>
            
            <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; color: #333;">
              ${confirmationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
              این ایمیل برای تایید حساب کاربری شما ارسال شده است. اگر شما این درخواست را نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              © 2024 ویپانا. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      `,
      text: `
        تایید حساب کاربری ویپانا
        
        برای تکمیل ثبت نام، لطفاً این لینک را کلیک کنید:
        ${confirmationUrl}
        
        اگر دکمه کار نمی‌کند، لینک را در مرورگر خود کپی کنید.
        
        © 2024 ویپانا
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'بازیابی رمز عبور - ویپانا',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">ویپانا</h1>
            
            <h2 style="color: #333; margin-bottom: 20px;">بازیابی رمز عبور</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              برای بازیابی رمز عبور خود، لطفاً روی دکمه زیر کلیک کنید.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                بازیابی رمز عبور
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              اگر دکمه بالا کار نمی‌کند، می‌توانید این لینک را در مرورگر خود کپی کنید:
            </p>
            
            <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all; color: #333;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
              این لینک فقط برای یک بار استفاده معتبر است. اگر شما این درخواست را نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              © 2024 ویپانا. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      `,
      text: `
        بازیابی رمز عبور ویپانا
        
        برای بازیابی رمز عبور، لطفاً این لینک را کلیک کنید:
        ${resetUrl}
        
        اگر دکمه کار نمی‌کند، لینک را در مرورگر خود کپی کنید.
        
        © 2024 ویپانا
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
