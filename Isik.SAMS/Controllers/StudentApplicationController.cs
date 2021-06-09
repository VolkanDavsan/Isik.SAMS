using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
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
            ViewBag.ExtensionNotAllowed = TempData["ExtensionNotAllowed"] == null ? null : TempData["ExtensionNotAllowed"].ToString();
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
                int appId = Convert.ToInt32(Session["ApplicationId"]);
                var files = db.SAMS_Files.Where(x => x.StudentApplicationId == appId).ToList();
                if (files != null)
                {
                    ViewBag.IsEducationalInfoEntered = "true";
                    foreach (var a in files)
                    {
                        if (a.FileName.Contains("HighSchoolTranscript"))
                        {
                            model.highSchoolTranscriptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        } 
                        else if (a.FileName.Contains("ResidencePermit"))
                        {
                            model.residencePermitContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("EquivalenceCertificate"))
                        {
                            model.equivalenceCertificateContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("HighSchoolDiploma"))
                        {
                            model.highSchoolDiplomaContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("StudentPhoto"))
                        {
                            model.studentPhotoContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("InternationalExamScore"))
                        {
                            model.internationalExamScoreContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("CopyofPassportorIDCard"))
                        {
                            model.IdorPassportCopyContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("EnglishLanguageProficiencyScore"))
                        {
                            model.englishLanguageProfScoreContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("CV"))
                        {
                            model.cvContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("BachelorDiploma"))
                        {
                            model.bachelorDiplomaContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("BachelorTranscript"))
                        {
                            model.bachelorTranscriptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("MasterDiploma"))
                        {
                            model.masterDiplomaContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("MasterTranscript"))
                        {
                            model.masterTranscriptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("ReferenceLetter1"))
                        {
                            model.referenceLetter1ContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("ReferenceLetter2"))
                        {
                            model.referenceLetter2ContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }

                    }
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

        public FileResult DownloadFile(int id, string name)
        {
            var files = db.SAMS_Files.Where(x => x.StudentApplicationId == id).ToList();
            if (files != null)
            {
                foreach (var a in files)
                {
                    if(a.FileName == name + "" + a.FileExtension)
                    {
                        return File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                    }                    
                }
            }
            return null;
        }

        public ActionResult DeleteFile(int id, string name)
        {
            var files = db.SAMS_Files.Where(x => x.StudentApplicationId == id).ToList();
            if (files != null)
            {
                foreach (var a in files)
                {
                    if (a.FileName == name + "" + a.FileExtension)
                    {
                        db.SAMS_Files.Remove(a);
                        db.SaveChanges();
                    }
                }
            }
            return RedirectToAction("Insert");
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
                if (application.IdorPassportCopy != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "CopyofPassportorIDCard";
                    string fileName = Path.GetFileName(application.IdorPassportCopy.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.IdorPassportCopy.InputStream.Length];
                    application.IdorPassportCopy.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                    
                }
                if (application.englishLanguageProfScore != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "EnglishLanguageProficiencyScore";
                    string fileName = Path.GetFileName(application.englishLanguageProfScore.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.englishLanguageProfScore.InputStream.Length];
                    application.englishLanguageProfScore.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.cv != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "CV";
                    string fileName = Path.GetFileName(application.cv.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.cv.InputStream.Length];
                    application.cv.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.bachelorDiploma != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "BachelorDiploma";
                    string fileName = Path.GetFileName(application.bachelorDiploma.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.bachelorDiploma.InputStream.Length];
                    application.bachelorDiploma.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.bachelorTranscript != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "BachelorTranscript";
                    string fileName = Path.GetFileName(application.bachelorTranscript.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.bachelorTranscript.InputStream.Length];
                    application.bachelorTranscript.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
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
                if (application.IdorPassportCopy != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "CopyofPassportorIDCard";
                    string fileName = Path.GetFileName(application.IdorPassportCopy.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.IdorPassportCopy.InputStream.Length];
                    application.IdorPassportCopy.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.englishLanguageProfScore != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "EnglishLanguageProficiencyScore";
                    string fileName = Path.GetFileName(application.englishLanguageProfScore.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.englishLanguageProfScore.InputStream.Length];
                    application.englishLanguageProfScore.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.cv != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "CV";
                    string fileName = Path.GetFileName(application.cv.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.cv.InputStream.Length];
                    application.cv.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.bachelorDiploma != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "BachelorDiploma";
                    string fileName = Path.GetFileName(application.bachelorDiploma.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.bachelorDiploma.InputStream.Length];
                    application.bachelorDiploma.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.bachelorTranscript != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "BachelorTranscript";
                    string fileName = Path.GetFileName(application.bachelorTranscript.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.bachelorTranscript.InputStream.Length];
                    application.bachelorTranscript.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.masterDiploma != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "MasterDiploma";
                    string fileName = Path.GetFileName(application.masterDiploma.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.masterDiploma.InputStream.Length];
                    application.masterDiploma.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.masterTranscript != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "MasterTranscript";
                    string fileName = Path.GetFileName(application.masterTranscript.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.masterTranscript.InputStream.Length];
                    application.masterTranscript.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.referenceLetter1 != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "ReferenceLetter1";
                    string fileName = Path.GetFileName(application.referenceLetter1.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.referenceLetter1.InputStream.Length];
                    application.referenceLetter1.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.referenceLetter2 != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "ReferenceLetter2";
                    string fileName = Path.GetFileName(application.referenceLetter2.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.referenceLetter2.InputStream.Length];
                    application.referenceLetter2.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
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
                if (application.highSchoolTranscript != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "HighSchoolTranscript";
                    string fileName = Path.GetFileName(application.highSchoolTranscript.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.highSchoolTranscript.InputStream.Length];
                    application.highSchoolTranscript.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.residencePermit != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "ResidencePermit";
                    string fileName = Path.GetFileName(application.residencePermit.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.residencePermit.InputStream.Length];
                    application.residencePermit.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.equivalenceCertificate != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "EquivalenceCertificate";
                    string fileName = Path.GetFileName(application.equivalenceCertificate.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.equivalenceCertificate.InputStream.Length];
                    application.equivalenceCertificate.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.highSchoolDiploma != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "HighSchoolDiploma";
                    string fileName = Path.GetFileName(application.highSchoolDiploma.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.highSchoolDiploma.InputStream.Length];
                    application.highSchoolDiploma.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.studentPhoto != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "StudentPhoto";
                    string fileName = Path.GetFileName(application.studentPhoto.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.studentPhoto.InputStream.Length];
                    application.studentPhoto.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.internationalExamScore != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "InternationalExamScore";
                    string fileName = Path.GetFileName(application.internationalExamScore.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.internationalExamScore.InputStream.Length];
                    application.internationalExamScore.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.IdorPassportCopy != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "CopyofPassportorIDCard";
                    string fileName = Path.GetFileName(application.IdorPassportCopy.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.IdorPassportCopy.InputStream.Length];
                    application.IdorPassportCopy.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
                }
                if (application.englishLanguageProfScore != null)
                {
                    var file = new SAMS_Files();
                    file.FileCreateDate = DateTime.Now;
                    string newFileName = "EnglishLanguageProficiencyScore";
                    string fileName = Path.GetFileName(application.englishLanguageProfScore.FileName);
                    file.FileName = newFileName + "" + Path.GetExtension(fileName);
                    file.FileExtension = Path.GetExtension(file.FileName);
                    byte[] fileData = new byte[application.englishLanguageProfScore.InputStream.Length];
                    application.englishLanguageProfScore.InputStream.Read(fileData, 0, fileData.Length);
                    file.FileData = fileData;
                    file.StudentApplicationId = application.Id;
                    if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                    {
                        db.SAMS_Files.Add(file);
                    }
                    else
                    {
                        TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                    }
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