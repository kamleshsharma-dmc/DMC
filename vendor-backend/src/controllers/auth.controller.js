
import User from '../models/User.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
// Signup API
export const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      companyName,
      password,
      confirmPassword,
    } = req.body

    // Required field validation
    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !mobile?.trim() ||
      !companyName?.trim() ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      })
    }

    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be 10 digits',
      })
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match',
      })
    }

    // Check duplicate email or mobile
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { mobile: mobile.trim() },
      ],
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email.trim().toLowerCase()
            ? 'Email already registered'
            : 'Mobile number already registered',
      })
    }

    // Create user
    // Role is always user for public signup
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      companyName: companyName.trim(),
      password,
      role: 'user',
    })

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        companyName: user.companyName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Signup Error:', error)

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email or mobile number already registered',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to create account',
    })
  }
}
