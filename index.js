import express from 'express'
import hbs from 'hbs'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import {readPosts, readUser, insertPosts, insertusers, likefun, sharefun} from './operation.js'
import cookieParser from 'cookie-parser'

const app = express()


app.set('view engine','hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.render("login")
})

app.post('/login',async(req,res)=>{
    // console.log(req.body.profile)
    // console.log(req.body.password)
    // const output = await readUser(req.body.name)
    const output = await readUser(req.body.name || req.body.profile)
    const password = output[0].password
    if(password === req.body.password)
    {
        const secret = "00add12754fbacb38b0b7af94d74443666cf0dbfcba738d9e854eSSf98c98ed511f753fbc94ceeb140f8a0e1df993fb029b0727e6a8bb4cef030c0f6f851dff9"
        const payload = {"profile":output[0].profile, "name":output[0].name, "headline":output[0].headline}
        const token = jwt.sign(payload, secret)
        res.cookie("token", token)
        res.redirect("/posts")
        console.log(token)
    }
    else{
        res.send("wrong")
    }
    console.log(output)
})

app.post('/like',async(req,res)=>{
    await likefun(req.body.content)
    res.redirect('/posts')
})

app.post('/share',async(req,res)=>{
    await sharefun(req.body.content)
    res.redirect('/posts')
})

app.post('/addpost',async(req,res)=>{
    await insertPosts(req.body.profile,req.body.content)
    res.redirect("/posts")
})

app.get('/posts',verifyLogin,async(req,res)=>{
    const output = await readPosts()
    res.render("posts",{
        data: output,
        // userInfo: req.profile,
        // userInfo: req.name,
        // userInfo: req.headline
        userInfo: req.payload
    })
})

function verifyLogin(req, res, next){
    const secret = "00add12754fbacb38b0b7af94d74443666cf0dbfcba738d9e854eSSf98c98ed511f753fbc94ceeb140f8a0e1df993fb029b0727e6a8bb4cef030c0f6f851dff9"
    const token = req.cookies.token
    jwt.verify(token, secret,(err, payload)=>{
        if(err) return res.sendStatus(403)
        req.payload = payload
    })

    next()
}

app.get('/register',(req,res)=>{
    res.render("register")
})

app.post('/addregister',async(req,res)=>{
    if(req.body.password === req.body.cpassword){
        await insertusers(req.body.name, req.body.profile, req.body.password, req.body.headline)
        
        res.redirect('/')
    }
    else{
        res.send("password and confirm password did not match")
    }
})


app.listen(3000,()=>{
    console.log("listening.....")
})