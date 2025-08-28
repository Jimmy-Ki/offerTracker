import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, JwtPayload } from '../types'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: User, secret: string): string {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    plan_type: user.plan_type
  }
  
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string, secret: string): JwtPayload {
  try {
    return jwt.verify(token, secret) as JwtPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}