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
            Session.Abandon();

            return View();
        }

        public ActionResult EmailVerification(SAMS_StudentApplications studentApplication)
        {
            ViewBag.LoginErrorMessage = "";
            int programId = Convert.ToInt32(Session["ProgramId"]);
            var studentApplicationDetail = db.SAMS_StudentApplications.Where(x => x.Email == studentApplication.Email && x.ProgramId == programId && x.Status != 5).FirstOrDefault();
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
                    var app = db.SAMS_StudentApplications.Where(x => x.Email == application.Email && x.ProgramId == application.ProgramId).FirstOrDefault();
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
            int sessionProgram = Convert.ToInt32(Session["ProgramId"]);
            ViewBag.Departments = new SelectList(db.SAMS_DepartmentProgramRel.Where(x => x.ProgramId == sessionProgram).ToList(), "DepartmentId", "DepartmentName");
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
            ViewBag.FilesUploaded = TempData["FilesUploaded"] == null ? null : TempData["FilesUploaded"].ToString();
            List<SelectListItem> countryList = new List<SelectListItem>();
            foreach (var a in countries)
            {
                countryList.Add(new SelectListItem { Text = a, Value = a });
            }
            ViewBag.Countries = new SelectList(countryList, "Value", "Text");
            ViewBag.FileSizeWarining = TempData["FileSizeWarning"] == null ? null : TempData["FileSizeWarning"].ToString();
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
                if (files.Count > 0)
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

            if (app.ProgramId == 2)
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
                    if (application.IdorPassportCopy.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.englishLanguageProfScore != null)
                {
                    if (application.englishLanguageProfScore.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
                if (application.cv != null)
                {
                    if (application.cv.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
                if (application.bachelorDiploma != null)
                {
                    if (application.bachelorDiploma.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.bachelorTranscript != null)
                {
                    if (application.bachelorTranscript.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
            }
            if (app.ProgramId == 3)
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
                    if (application.IdorPassportCopy.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.englishLanguageProfScore != null)
                {
                    if (application.englishLanguageProfScore.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
                if (application.cv != null)
                {
                    if (application.cv.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
                if (application.bachelorDiploma != null)
                {
                    if (application.bachelorDiploma.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.bachelorTranscript != null)
                {
                    if (application.bachelorTranscript.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
                if (application.masterDiploma != null)
                {
                    if (application.masterDiploma.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.masterTranscript != null)
                {
                    if (application.masterTranscript.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.referenceLetter1 != null)
                {
                    if (application.referenceLetter1.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.referenceLetter2 != null)
                {
                    if (application.referenceLetter2.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
            }
            if (app.ProgramId == 1)
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
                    if (application.highSchoolTranscript.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.residencePermit != null)
                {
                    if (application.residencePermit.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.equivalenceCertificate != null)
                {
                    if (application.equivalenceCertificate.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.highSchoolDiploma != null)
                {
                    if (application.highSchoolDiploma.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.studentPhoto != null)
                {
                    if (application.studentPhoto.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.internationalExamScore != null)
                {
                    if (application.internationalExamScore.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.IdorPassportCopy != null)
                {
                    if (application.IdorPassportCopy.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }
                }
                if (application.englishLanguageProfScore != null)
                {
                    if (application.englishLanguageProfScore.ContentLength < 10000000)
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
                            TempData["FilesUploaded"] = "true";
                            db.SAMS_Files.Add(file);
                            db.SaveChanges();
                        }
                        else
                        {
                            TempData["ExtensionNotAllowed"] = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                        }
                    }
                    else
                    {
                        TempData["FileSizeWarning"] = "Maximum file size is 10 MB.";
                    }

                }
            }
            db.SaveChanges();
            TempData["IsPersonalInfoEntered"] = "true";
            return RedirectToAction("Insert");
        }

        public FileResult DownloadFile(int id, string name)
        {
            var files = db.SAMS_Files.Where(x => x.StudentApplicationId == id).ToList();
            if (files != null)
            {
                foreach (var a in files)
                {
                    if (a.FileName == name + "" + a.FileExtension)
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

        public ActionResult AuthenticateGuid(Guid guid)
        {
            
            var application = db.SAMS_StudentApplications.Where(x => x.GUID == guid).FirstOrDefault();
            if (application != null)
            {
                Session["ApplicationId"] = application.Id;
                Session["ProgramId"] = application.ProgramId;
                TempData["IsAuthenticated"] = "true";
                TempData["isMailSent"] = "true";
                TempData["IsPersonalInfoEntered"] = "true";
                TempData["IsEducationalInfoEntered"] = "true";
                return RedirectToAction("Insert");
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        public ActionResult AuthenticateGuidForBankReceipt(Guid guid)
        {
            
            var application = db.SAMS_StudentApplications.Where(x => x.GUID == guid).FirstOrDefault();
            if (application != null)
            {
                Session["ApplicationId"] = application.Id;
                return RedirectToAction("UploadBankReceipt");
            }
            else
            {
                return RedirectToAction("Index");
            }
        }
        [HttpGet]
        public ActionResult UploadBankReceipt()
        {
            
            var application = db.SAMS_StudentApplications.Find(Convert.ToInt32(Session["ApplicationId"]));
            return View(application);
        }
        [HttpPost]
        public ActionResult UploadBankReceipt(SAMS_StudentApplications application)
        {
            
            var currentApplication = db.SAMS_StudentApplications.Find(application.Id);
            var bankReceipt = db.SAMS_Files.Where(x => x.StudentApplicationId == currentApplication.Id &&
                                                       x.FileName.Contains("BankReceipt")).FirstOrDefault();
            if (application.BankReceipt != null)
            {
                if (application.BankReceipt.ContentLength < 10000000)
                {
                    if (bankReceipt == null)
                    {
                        var file = new SAMS_Files();
                        file.FileCreateDate = DateTime.Now;
                        string newFileName = "BankReceipt";
                        string fileName = Path.GetFileName(application.BankReceipt.FileName);

                        file.FileName = newFileName + "" + Path.GetExtension(fileName);
                        file.FileExtension = Path.GetExtension(file.FileName);
                        byte[] fileData = new byte[application.BankReceipt.InputStream.Length];
                        application.BankReceipt.InputStream.Read(fileData, 0, fileData.Length);
                        file.FileData = fileData;
                        file.StudentApplicationId = application.Id;
                        if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png" || file.FileExtension == ".docx" || file.FileExtension == ".pdf")
                        {
                            ViewBag.FilesUploaded = "true";
                            db.SAMS_Files.Add(file);
                            var app = db.SAMS_StudentApplications.Find(application.Id);
                            app.GUID = Guid.NewGuid();
                            app.Status = 9;
                            db.SaveChanges();
                        }
                        else
                        {
                            ViewBag.ExtensionNotAllowed = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                            return View(application);
                        }
                    }
                    else
                    {
                        bankReceipt.FileCreateDate = DateTime.Now;
                        string newFileName = "BankReceipt";
                        string fileName = Path.GetFileName(application.BankReceipt.FileName);

                        bankReceipt.FileName = newFileName + "" + Path.GetExtension(fileName);
                        bankReceipt.FileExtension = Path.GetExtension(bankReceipt.FileName);
                        byte[] fileData = new byte[application.BankReceipt.InputStream.Length];
                        application.BankReceipt.InputStream.Read(fileData, 0, fileData.Length);
                        bankReceipt.FileData = fileData;
                        bankReceipt.StudentApplicationId = application.Id;
                        if (bankReceipt.FileExtension == ".jpg" || bankReceipt.FileExtension == ".jpeg" || bankReceipt.FileExtension == ".png" || bankReceipt.FileExtension == ".docx" || bankReceipt.FileExtension == ".pdf")
                        {
                            ViewBag.FilesUploaded = "true";
                            var app = db.SAMS_StudentApplications.Find(application.Id);
                            app.GUID = Guid.NewGuid();
                            app.Status = 9;
                            db.SaveChanges();
                        }
                        else
                        {
                            ViewBag.ExtensionNotAllowed = "Only jpg/jpeg, png, pdf and docx files are allowed!";
                            return View(application);
                        }
                    }
                }
                else
                {
                    ViewBag.FileSizeWarning = "Maximum file size is 10 MB.";
                    return View(application);
                }
            }
            return View(application);
        }
        [HttpGet]
        public ActionResult Programs()
        {
            
            ViewBag.Departments = db.SAMS_DepartmentProgramRel.ToList();
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            return View();
        }

        [HttpPost]
        public ActionResult Programs(SAMS_DepartmentProgramRel dp1)
        {
            
            if (dp1.ProgramId != null)
            {
                ViewBag.Departments = db.SAMS_DepartmentProgramRel.Where(x => x.ProgramId == dp1.ProgramId).ToList();
            }
            else
            {
                ViewBag.Departments = db.SAMS_DepartmentProgramRel.ToList();
            }

            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");

            return View();
        }
    }
}