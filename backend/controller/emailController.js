import transporter from '../config/emailConfig.js'; 

const otpStore = new Map();

// individual functions-ai 'export const' moolama export pannunga
export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  otpStore.set(email, otp);
  setTimeout(() => otpStore.delete(email), 300000); 

  try {
    await transporter.sendMail({
      from: `"Voting Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verification OTP",
      text: `Your OTP is: ${otp}`
    });
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
};

export const verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (otpStore.get(email) === otp) {
    otpStore.delete(email);
    res.status(200).json({ message: "Verified successfully!" });
  } else {
    res.status(400).json({ error: "Invalid or expired OTP" });
  }
};