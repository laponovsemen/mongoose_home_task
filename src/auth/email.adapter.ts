import * as nodemailer from "nodemailer"

export class EmailAdapter {
  async sendEmail(email : string, code : string) {
    let transport = nodemailer.createTransport({
      service : "gmail",
      auth : {
        user : "simsbury65@gmail.com",
        pass : "alayuxylcjthjcdi"
      }
    })

    const subject = "Registration"
    const message = `<h1>Thank for your registration</h1>
                        <p>To finish registration please follow the link below:
                        <a href='https://home-task-4.vercel.app/registration-confirmation?code=${code}'>complete registration</a>
                        </p>`
    let info = await transport.sendMail({
      from : 'Semen <simsbury65@gmail.com>',
      to : email,
      subject: subject,
      html: message
    })
    //console.log(info)
    return info
  }
  async sendEmailForPasswordRecovery(email : string, recoveryCode : string) {
    let transport = nodemailer.createTransport({
      service : "gmail",
      auth : {
        user : "simsbury65@gmail.com",
        pass : "alayuxylcjthjcdi"
      }
    })
    const subject = "Password Recovery"
    const message = `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://home-task-4.vercel.app/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
        </p>`

    let info = await transport.sendMail({
      from : 'Semen <simsbury65@gmail.com>',
      to : email,
      subject: subject,
      html: message
    })
    //console.log(info)
    return info
  }
}