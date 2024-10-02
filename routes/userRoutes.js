const express = require('express')
const { activateAccount, changePassword, reActiveAccount, postWithdrawalRequest, getWithdrawlPageData, getWalletPageData, getImmidiateChildren, getDashboardDetails, getChildrenLevelWise, getTeamDetails } = require('../controllers/userControllers')
const { authenticate, authorizeRoles } = require('../middleware/accessablityMidddleWare')
const Router = express.Router()

Router.post('/activateAccount/:id',authenticate, authorizeRoles(['user']),activateAccount)
// Router.post('/changePassword/:id',authenticate, authorizeRoles(['user']),changePassword)
Router.put('/reactivateAccount/:id',authenticate, authorizeRoles(['user']),reActiveAccount)
Router.get('/getDashboardDetails/:userId',authenticate, authorizeRoles(['user']),getDashboardDetails)
Router.get('/getWalletPageData/:id',authenticate, authorizeRoles(['user']),getWalletPageData)
Router.post('/withdrawalRequest/:id',authenticate, authorizeRoles(['user']),postWithdrawalRequest)
Router.get('/getImmidiateChildren/:id',authenticate, authorizeRoles(['user']),getImmidiateChildren)
Router.get('/getWithdrawlPageData/:id',authenticate, authorizeRoles(['user']),getWithdrawlPageData)
Router.get('/getChildrenLevelWise/:id',authenticate, authorizeRoles(['user']),getChildrenLevelWise)
Router.get('/getTeamDetails/:id',authenticate, authorizeRoles(['user']),getTeamDetails)


module.exports = Router