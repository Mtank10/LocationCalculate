const express = require('express');
const { createNewUser, handleChangeStatus, login, calculateDistance, handleWeek_Wise_User } = require('../controllers/userController');

const router = express.Router()

//Create User api endpoint with validation.

router.post('/create',createNewUser);

router.post('/login',login);

router.patch('/change-status',handleChangeStatus);

router.get('/distance',calculateDistance);
router.get('/week-wise',handleWeek_Wise_User);

module.exports = router;