using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;
using MailKit.Security;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;

namespace Isik.SAMS.Controllers
{
    public class LoginController : Controller
    {
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Insert()
        {
            return View();
        }

        public ActionResult Logout()
        {
            Session.Abandon();
            return View("Index");
        }

        public ActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public ActionResult ForgotPassword(SAMS_Users user)
        {
            ViewBag.LoginErrorMessage = "";
            if (user.Email == null)
            {
                ViewBag.LoginErrorMessage = "";
                return View("ForgotPassword");
            }
            var userDetails = db.SAMS_Users.Where(x => x.Email == user.Email).FirstOrDefault();
            if (userDetails == null)
            {
                ViewBag.LoginErrorMessage = "The E-Mail you entered is not registered.";
            } else
            {
                var email = new MimeMessage();
                var from = "samsinfo.noreply@gmail.com";
                var subject = "SAMS info - Password Reset";
                email.From.Add(MailboxAddress.Parse(from));
                email.To.Add(MailboxAddress.Parse(user.Email));
                email.Subject = subject;
                Random generator = new Random();
                string r = generator.Next(0, 1000000).ToString("D6");                
                email.Body = new TextPart(TextFormat.Html) { Text = "We got your request for password reset! Enter this code to the site to reset your password. Code: " + r };
                //user.RecoveryCode = Convert.ToInt32(r);

                var smtp = new SmtpClient();
                smtp.Connect("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                smtp.Authenticate("samsinfo.noreply@gmail.com", "Isiksams.123");
                smtp.Send(email);
                smtp.Disconnect(true);
                ViewBag.isMailSent = true;
            }
            return View();
        }

        [HttpPost]
        public ActionResult Authorize(SAMS_Users user)
        {            
            using (db)
            {
                var userDetails = db.SAMS_Users.Where(x => x.Email == user.Email && x.Password == user.Password).FirstOrDefault();
                if (userDetails == null)
                {
                    ViewBag.LoginErrorMessage = "Wrong Email or Password!";
                    return View("Index");
                }
                else
                {
                    if (userDetails.UserType != 1002)
                    {
                        Session["UserId"] = userDetails.Id;
                        Session["UserType"] = userDetails.UserType;
                        Session["DepartmentId"] = userDetails.DepartmentId;
                        Session["ProgramId"] = userDetails.ProgramId;
                        Session["PhoneNumber"] = userDetails.PhoneNumber;
                        Session["FirstName"] = userDetails.FirstName;
                        Session["LastName"] = userDetails.LastName;
                        Session["Email"] = userDetails.Email;
                    }
                    else
                    {
                        Session["AdminId"] = userDetails.Id;
                        Session["UserType"] = userDetails.UserType;
                        Session["FirstName"] = userDetails.FirstName;
                        Session["LastName"] = userDetails.LastName;
                        Session["PhoneNumber"] = userDetails.PhoneNumber;
                        Session["Email"] = userDetails.Email;
                    }
                    return RedirectToAction("Index", "Home");
                }
            }
        }
    }
}