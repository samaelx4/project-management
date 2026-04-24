import Mailgen from "mailgen";
import nodemailer from 'nodemailer'


const sendEmail =  async (options)=>{
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanager.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: Number(process.env.MAILTRAP_SMTP_PORT),
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    const mail = {
        from: "taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email sending failed:", error)
        throw error  
    }
}

const emailVerificationMailgenContent = (username, verificationUrl)=>{
    return {
        body: {
            name: username,
            intro: "Welcome to our app! we're excited to have u on board",
            action: {
                instructions: "To verify your email please click on the following button",
                button: {
                    color: "#1aae5aff",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: "Need help? Feel free to reply to this email and we will be there in no time"
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl)=>{
    return {
        body: {
            name: username,
            intro: "we got a request to reset ut password",
            action: {
                instructions: "To reset ur password please click on the following button",
                button: {
                    color: "#1aae5aff",
                    text: "Reset your Password",
                    link: passwordResetUrl
                }
            },
            outro: "Need help? Feel free to reply to this email and we will be there in no time"
        }
    }
}

export {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail}