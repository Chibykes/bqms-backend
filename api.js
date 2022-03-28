const express = require('express');
const Users = require('./models/Users');
const Appointments = require('./models/Appointments');
const Offices = require('./models/Offices');
const app = express.Router();
const passport = require('passport');
const gen_id = require('./utils/genIDs');
const bcrypt = require('bcryptjs');
const { ensureAuth } = require('./config/auth');


app.post('/register', (req, res) => {
    const id = `Q${gen_id(['genUppercase','genNumber'],5)}`;
    Users.create({
        id,
        ...req.body,
        password: bcrypt.hashSync(
            req.body.password, 
            bcrypt.genSaltSync(10)
        )
    });

    res.send({ 
        status: 'success',
        msg: 'User created Successfully',
        id
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if(err) return res.json({status: 'error', msg: 'Error Authenticating'});
        if(typeof(user) === 'string') return res.json({status: 'error', msg: user});

        req.login(user, err => {
            if(err) return res.json({status: 'error', msg: 'Error Authenticatingr'});
            
            res.json({ 
                status: 'success',
                msg: 'User successfully authenticated',
                user,
            });
        });
    })(req, res, next);
});

app.get('/appointments', ensureAuth, async(req, res)=>{
    const data = await Appointments.find({ user: req.user._id })
                        .populate('user', 'name id -_id')
                        .sort({updatedAt: -1});;
    res.json({
        status: 'success',
        data,
        user: req.user
    })
});

app.get('/appointments/admin', ensureAuth, async(req, res)=>{
    const data = await Appointments.find({ })
                        .populate('user', 'name id -_id')
                        .sort({updatedAt: -1});
    res.json({
        status: 'success',
        data,
        user: req.user
    })
});

app.get('/appointments/:id', ensureAuth, async(req, res)=>{
    const data = await Appointments.findOne({ user: req.user._id, id: req.params.id })
                        .populate('user', 'name id -_id')
                        .sort({updatedAt: -1});
    res.json({
        status: 'success',
        data,
        user: req.user
    })
});

app.get('/appointments/admin/:id/:status/:date/:office', ensureAuth, async(req, res)=>{
    const { status, id, date, office } = req.params;
    let e = {};

    if(status === 'approved'){
        const last = await Appointments
            .find({ status, date, office })
            .sort({updatedAt: -1});

        if(last.length > 0){
            if(last[0].queue_no){
                e.queue_no = Number(last[0].queue_no) + 1;
            }
        } else {
            e.queue_no = 1;
        }

        e = {
            ...e,
            ewt: 20,
            est: 15,
        }
    }

    await Appointments
        .findOneAndUpdate({ id }, {$set: { status, ...e }})
        .populate('user', 'name id -_id')
        .sort({updatedAt: -1});

    const data = await Appointments.findOne({ id })
                    .populate('user', 'name id -_id')
                    .sort({updatedAt: -1});

    res.json({
        status: 'success',
        data,
        user: req.user
    });
});

app.post('/appointments/new', ensureAuth, async(req, res)=>{
    
    const id = `Q${gen_id(['genUppercase','genNumber'],7)}`;
    const appointment = await Appointments.create({
        id,
        ...req.body,
        user: req.user._id,
    });

    res.send({
        status: 'success',
        msg: 'Created Appointment Successfully',
        appointment,
        user: req.user,
    })
});

app.get('/appointments/delete/:id', ensureAuth, async(req, res) => {
    await Appointments.findOneAndDelete({ id: req.params.id });
    const data = await Appointments.find({ user: req.user._id })
                        .populate('user', 'name id -_id')
                        .sort({updatedAt: -1});

    res.json({
        data,
        user:req.user
    });
});

app.get('/track', ensureAuth, async(req, res) => {
    const data = {
        all: await Appointments.countDocuments({ user: req.user._id }),
        success: await Appointments.countDocuments({ status: 'success', user: req.user._id }),
        pending: await Appointments.countDocuments({ status: 'pending', user: req.user._id }),
        approved: await Appointments.countDocuments({ status: 'approved', user: req.user._id }),
        cancelled: await Appointments.countDocuments({ status: 'cancelled', user: req.user._id }),
        all_student: await Users.countDocuments({ role: 'student' })
    }

    res.json({
        data,
        user:req.user
    });
});

app.get('/offices', ensureAuth, async(req, res) => {
    const data = await Offices.find({  }).sort({name: 1})

    res.json({
        data,
        user:req.user
    });
});

app.get('/offices/delete/:id', ensureAuth, async(req, res) => {
    await Offices.findOneAndDelete({ id: req.params.id });
    const data = await Offices.find({  }).sort({name: 1})

    res.json({
        data,
        user:req.user
    });
});

app.post('/offices', ensureAuth, async(req, res) => {
    
    const id = `O${gen_id(['genUppercase','genNumber'],5)}`;
    const data = await Offices.create({
        id,
        ...req.body
    });

    res.json({
        data,
        user:req.user
    });
});

app.get('/log-out', (req, res)=>{
    req.logOut();
    res.send({
        status: 'success',
        msg: 'User Succeesfully Logged Out...',
        user: req.user
    })
});

module.exports = app;