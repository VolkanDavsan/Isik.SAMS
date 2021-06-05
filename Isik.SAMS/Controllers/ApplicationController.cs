using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;

namespace Isik.SAMS.Controllers
{
    public class ApplicationController : Controller
    {
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        // GET: Application
        public ActionResult Index()
        {
            Dictionary<int, string> dicPrograms = new Dictionary<int, string>();
            List<SAMS_Program> programList = db.SAMS_Program.ToList<SAMS_Program>();
            foreach (SAMS_Program a in programList)
            {
                dicPrograms.Add(a.Id, a.ProgramName);
            }
            ViewBag.Programs = dicPrograms;
            
            return View();
        }

        public ActionResult EmailVerification(SAMS_StudentApplications studentApplication)
        {
            ViewBag.LoginErrorMessage = "";
            int programId = Convert.ToInt32(Session["ProgramId"]);
            var studentApplicationDetail = db.SAMS_StudentApplications.Where(x => x.Email == studentApplication.Email && x.ProgramId == programId).FirstOrDefault();
            if (studentApplicationDetail == null)
            {                
                var email = new MimeMessage();
                var from = "SAMS SAMS";
                var subject = "SAMS info - E-Mail Verification";
                email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                email.To.Add(new MailboxAddress(studentApplication.Email, studentApplication.Email));
                email.Subject = subject;
                Random generator = new Random();
                string r = generator.Next(0, 1000000).ToString("D6");
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = @"<h1> As the SAMS team, </h1>" +
                    @"<h3>To verify the entered email is yours,</h3>" +
                    @"<br/>" +
                    @"<p>Enter this code to the site to verify your email.</p>" +
                    @"<br/>" +
                    @"<p>Code: " + r + "</p>"
                };

                var application = new SAMS_StudentApplications();
                application.ProgramId = Convert.ToInt32(Session["ProgramId"]);
                application.Email = studentApplication.Email;
                application.VerificationCode = r;
                db.SAMS_StudentApplications.Add(application);
                db.SaveChanges();
                var app = db.SAMS_StudentApplications.Last();
                TempData["ApplicationId"] = app.Id;
                using (SmtpClient smtp = new SmtpClient())
                {
                    smtp.Connect("smtp.gmail.com", 465, true);
                    smtp.Authenticate("samsinfo.noreply@gmail.com", "zywwcswqzucuzumw");
                    smtp.Send(email);
                    smtp.Disconnect(true);
                    TempData["IsMailSent"] = "true";
                }
            }
            else
            {
                if (studentApplication.VerificationCode == null)
                {
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - E-Mail Verification";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(studentApplication.StudentFirstName + "" + studentApplication.StudentLastName, studentApplication.Email));
                    email.Subject = subject;
                    Random generator = new Random();
                    string r = generator.Next(0, 1000000).ToString("D6");
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>To verify the entered email is yours,</h3>" +
                        @"<br/>" +
                        @"<p>Enter this code to the site to verify your email.</p>" +
                        @"<br/>" +
                        @"<p>Code: " + r + "</p>"
                    };

                    var stdApplication = db.SAMS_StudentApplications.Find(studentApplicationDetail.Id);
                    stdApplication.VerificationCode = r;
                    TempData["ApplicationId"] = studentApplicationDetail.Id;
                    db.SaveChanges();

                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Connect("smtp.gmail.com", 465, true);
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "zywwcswqzucuzumw");
                        smtp.Send(email);
                        smtp.Disconnect(true);
                        TempData["IsMailSent"] = "true";
                    }
                }
                else
                {
                    if (studentApplicationDetail.VerificationCode == studentApplication.VerificationCode)
                    {
                        TempData["IsAuthenticated"] = "true";
                        TempData["ApplicationId"] = studentApplicationDetail.Id;
                        var application = db.SAMS_StudentApplications.Find(Convert.ToInt32(studentApplicationDetail.Id));
                        application.VerificationCode = null;
                        db.SaveChanges();
                        return RedirectToAction("Insert");
                    }
                    else
                    {
                        TempData["Message"] = "Entered verification code is not the same. Please try again.";
                        TempData["messageClass"] = "alert-warning";
                    }
                }
            }
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
            return RedirectToAction("Insert");
        }
        [HttpGet]//get requesti asıl insert için post request kısımı yazılacak. ama aynı başvuruyu bulmak ve onun üzerinden update yapmak gerekiyor. Verification code ve program seçimini tutabilmek
        //için veri tabanında boş bir satıra açıp ekliyorum o aynı satır üzerinden düzenleme yapılarak doldurulacak. Mail db de olmasına gerek yok mailine bak spamda olabilir hala.
        public ActionResult Insert()
        {
            ViewBag.IsAuthenticated = TempData["IsAuthenticated"] == null ? null : TempData["IsAuthenticated"].ToString();
            ViewBag.isMailSent = TempData["isMailSent"] == null ? null : TempData["isMailSent"].ToString();
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            if (TempData["ApplicationId"] != null)
            {
                var model = db.SAMS_StudentApplications.Find(Convert.ToInt32(TempData["ApplicationId"]));
                model.VerificationCode = null;
                return View(model);
            }
            else
            {
                return View();
            }
        }

        //buna dokunma kanka ilk başta seçilen programın id sini tutabilmek için bunu yazdım.
        public ActionResult InsertInitial(int id)
        {
            Session["ProgramId"] = id;
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            return View("Insert");
        }
    }
}