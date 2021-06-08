using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;
using MailKit.Net.Smtp;
using MimeKit;
using MimeKit.Text;

namespace Isik.SAMS.Controllers
{
    public class StudentApplicationController : Controller
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
            if (Session["ApplicationId"] == null)
            {
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
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
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
                            Session["ApplicationId"] = studentApplicationDetail.Id;
                            var application = db.SAMS_StudentApplications.Find(Convert.ToInt32(studentApplicationDetail.Id));
                            application.VerificationCode = null;
                            db.SaveChanges();
                            return RedirectToAction("Insert");
                        }
                        else
                        {
                            TempData["VerificationErrorMessage"] = "Entered verification code is not the same. Please try again.";
                            TempData["IsMailSent"] = "true";
                            TempData["ApplicationId"] = studentApplicationDetail.Id;
                            return RedirectToAction("Insert");
                        }
                    }
                }

                return RedirectToAction("Insert");
            }
            else
            {
                var application = db.SAMS_StudentApplications.Find(Convert.ToInt32(Session["ApplicationId"]));
                TempData["IsAuthenticated"] = "true";
                TempData["IsMailSent"] = "true";
                if (application.HighSchoolGPA != null || application.MasterGPA != null || application.BachelorGPA != null)
                {
                    TempData["IsPersonalInfoEntered"] = "true";
                }
                return RedirectToAction("Insert");
            }

        }

        [HttpGet]
        public ActionResult Insert()
        {
            ViewBag.VerificationErrorMessage = TempData["VerificationErrorMessage"] == null ? null : TempData["VerificationErrorMessage"].ToString();
            ViewBag.IsAuthenticated = TempData["IsAuthenticated"] == null ? null : TempData["IsAuthenticated"].ToString();
            ViewBag.isMailSent = TempData["isMailSent"] == null ? null : TempData["isMailSent"].ToString();
            ViewBag.IsPersonalInfoEntered = TempData["IsPersonalInfoEntered"] == null ? null : TempData["IsPersonalInfoEntered"].ToString();
            ViewBag.IsEducationalInfoEntered = TempData["IsEducationalInfoEntered"] == null ? null : TempData["IsEducationalInfoEntered"].ToString();
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            ViewBag.StudentGenders = new SelectList(
               new List<SelectListItem> {
                   new SelectListItem { Text = "Male", Value = "Male" },
                   new SelectListItem { Text = "Female", Value =  "Female" },
                   }, "Value", "Text");
            ViewBag.Proficiency = new SelectList(
            new List<SelectListItem> {
                   new SelectListItem { Text = "Native Speaker", Value = "Native Speaker" },
                   new SelectListItem { Text = "I don't have", Value =  "I don't have" },
                   new SelectListItem { Text = "TOEFL PBT", Value = "TOEFL PBT" },
                   new SelectListItem { Text = "TOEFL CBT", Value = "TOEFL CBT" },
                   new SelectListItem { Text = "TOEFL IBT", Value = "TOEFL IBT" },
                   new SelectListItem { Text = "PTE Academic", Value =  "PTE Academic" },
                   new SelectListItem { Text = "YDS/e-YDS", Value = "YDS/e-YDS" },
                   new SelectListItem { Text = "UDS", Value =  "UDS" },
                   new SelectListItem { Text = "Other", Value = "Other" },
            }, "Value", "Text");
            var countries = CultureInfo.GetCultures(CultureTypes.SpecificCultures)
                   .Select(x => new RegionInfo(x.LCID).EnglishName)
                   .Distinct()
                   .OrderBy(x => x);
            
            List<SelectListItem> countryList = new List<SelectListItem>();
            foreach (var a in countries)
            {
                countryList.Add(new SelectListItem { Text = a, Value = a });
            }
            ViewBag.Countries = new SelectList(countryList, "Value", "Text");

            if (Session["ApplicationId"] != null)
            {
                ViewBag.IsAuthenticated = "true";
                ViewBag.isMailSent = "true";
                var model = db.SAMS_StudentApplications.Find(Convert.ToInt32(Session["ApplicationId"]));
                if (model.HighSchoolGPA != null || model.MasterGPA != null || model.BachelorGPA != null)
                {
                    ViewBag.IsPersonalInfoEntered = "true";
                }

                model.VerificationCode = null;
                return View(model);
            }
            else
            {
                if (TempData["ApplicationId"] != null)
                {
                    var model = db.SAMS_StudentApplications.Find(Convert.ToInt32(TempData["ApplicationId"]));
                    model.VerificationCode = null;
                    return View(model);
                }
                return View();
            }
        }

        [HttpPost]
        public ActionResult Insert(SAMS_StudentApplications application)
        {
            var app = db.SAMS_StudentApplications.Find(application.Id);
            app.GUID = Guid.NewGuid();
            app.DepartmentId = Convert.ToInt32(application.DepartmentId);
            app.StudentFirstName = application.StudentFirstName;
            app.StudentLastName = application.StudentLastName;
            app.Gender = application.Gender;
            app.CityofBirth = application.CityofBirth;
            app.DateofBirth = application.DateofBirth;
            app.PhoneNumber = application.PhoneNumber;
            app.Address = application.Address;
            app.Country = application.Country;
            app.Citizenship = application.Citizenship;
            app.PassportNumber = application.PassportNumber;
            app.MotherName = application.MotherName;
            app.FatherName = application.FatherName;
            app.CreatedTime = DateTime.Now;

            if (app.ProgramId == 6002)
            {
                app.BachelorGPA = application.BachelorGPA;
                app.BachelorGradDate = application.BachelorGradDate;
                app.BachelorProgram = application.BachelorProgram;
                app.BachelorUni = application.BachelorUni;
                app.BachelorCountry = application.BachelorCountry;
                app.LanguageProficiency = application.LanguageProficiency;
                var appStatus = db.SAMS_ApplicationStatus.Find(1);
                app.Status = 1;
                app.StatusName = appStatus.StatusName;
                if (application.BachelorGPA != null)
                {
                    TempData["IsEducationalInfoEntered"] = "true";
                }
            }
            else if (app.ProgramId == 6003)
            {                
                app.MasterGPA = application.MasterGPA;
                app.MasterGradDate = application.MasterGradDate;
                app.MasterProgram = application.MasterProgram;
                app.MasterUni = application.MasterUni;
                app.MasterCountry = application.MasterCountry;
                app.LanguageProficiency = application.LanguageProficiency;
                var appStatus = db.SAMS_ApplicationStatus.Find(1);
                app.Status = 1;
                app.StatusName = appStatus.StatusName;
                if (application.MasterGPA != null)
                {
                    TempData["IsEducationalInfoEntered"] = "true";
                }
            }
            else
            {
                app.HighSchoolCountry = application.HighSchoolCountry;
                app.HighSchoolGPA = application.HighSchoolGPA;
                app.HighSchoolGradYear = application.HighSchoolGradYear;
                app.HighSchoolName = application.HighSchoolName;
                app.HighSchoolCity = application.HighSchoolCity;
                app.IsGradFromUni = application.IsGradFromUni;
                app.LanguageExamScore = application.LanguageExamScore;
                app.DualCitizenship = application.DualCitizenship;
                app.BlueCardOwner = application.BlueCardOwner;
                app.LanguageProficiency = application.LanguageProficiency;
                var appStatus = db.SAMS_ApplicationStatus.Find(1);
                app.Status = 1;
                app.StatusName = appStatus.StatusName;
                if (application.HighSchoolGPA != null)
                {
                    TempData["IsEducationalInfoEntered"] = "true";
                }
            }
            db.SaveChanges();
            TempData["IsPersonalInfoEntered"] = "true";
            return RedirectToAction("Insert");
        }

        //buna dokunma kanka ilk başta seçilen programın id sini tutabilmek için bunu yazdım.
        public ActionResult InsertInitial(int id)
        {
            if (Session["ApplicationId"] != null)
            {
                var model = db.SAMS_StudentApplications.Find(Convert.ToInt32(Session["ApplicationId"]));
                if (model.ProgramId != id)
                {
                    Session.Abandon();
                }
            }
            Session["ProgramId"] = id;
            return View("Insert");
        }
    }
}