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
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
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
            }
            else
            {
                if (user.RecoveryCode == null)
                {
                    var email = new MimeMessage();
                    var from = "SAMS";
                    var subject = "SAMS info - Password Reset";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(user.FirstName + "" + user.LastName, user.Email));
                    email.Subject = subject;
                    Random generator = new Random();
                    string r = generator.Next(0, 1000000).ToString("D6");
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the system of your Student Application Management we heard your request to reset you password.</h1>" +
                        @"<br/>" +
                        @"<p>Enter this code to the site to reset your password.</p>" +
                        @"<br/>" +
                        @"<p>Code: " + r + "</p>"
                    };

                    var realUser = db.SAMS_Users.Find(userDetails.Id);
                    realUser.RecoveryCode = Convert.ToInt32(r);
                    db.SaveChanges();

                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Connect("smtp.gmail.com", 465, true);
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "zywwcswqzucuzumw");
                        smtp.Send(email);
                        smtp.Disconnect(true);
                        ViewBag.isMailSent = "true";
                    }
                } else
                {
                    if(userDetails.RecoveryCode == user.RecoveryCode)
                    {
                        if(user.NewPassword == user.ConfirmPassword)
                        {
                            var realUser = db.SAMS_Users.Find(userDetails.Id);
                            realUser.Password = user.NewPassword;
                            realUser.RecoveryCode = null;
                            realUser.ChangedTime = DateTime.Now;
                            db.SaveChanges();
                            TempData["Message"] = "Succesfully updated.";
                            TempData["messageClass"] = "alert-success";
                            return RedirectToAction("Index");
                        } else
                        {
                            TempData["Message"] = "New Password and Confirm Password do not match.";
                            TempData["messageClass"] = "alert-warning";
                        }

                    } else
                    {
                        TempData["Message"] = "Entered recovery code is not the same. Please try again.";
                        TempData["messageClass"] = "alert-warning";
                    }
                }
            }
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
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