
import express from 'express'
const router = express.Router()
import authController from '../controllers/auth.controller.js'
import loginLimiter from '../middleware/loginLimiter.js'

router.route('/login')
    .post( authController.login)// loginLimiter, authController.login)

router.route('/refresh')
    .get(authController.refresh)

router.route('/logout')
    .post(authController.logout)

export default router