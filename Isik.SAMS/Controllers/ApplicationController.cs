using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
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
            var user = db.SAMS_Users.Find(Convert.ToInt32(Session["UserId"]));
            var model = db.SAMS_StudentApplications.ToList();
            if (user.UserType == 2)
            {
                model = db.SAMS_StudentApplications.Where(x => x.Status == 2 || x.Status == 4 || x.Status == 5 || x.Status == 6).ToList();
            }

            foreach (var a in model)
            {
                var dep = db.SAMS_Department.Find(a.DepartmentId);
                if (dep != null)
                {
                    a.DepartmentName = dep.DepartmentName;
                }

                var prog = db.SAMS_Program.Find(a.ProgramId);
                if (prog != null)
                {
                    a.ProgramName = prog.ProgramName;
                }

                var statusName = db.SAMS_ApplicationStatus.Find(a.Status);
                if (statusName != null)
                {
                    a.StatusName = statusName.StatusName;
                }
            }
            string prev = Request.UrlReferrer.ToString();
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
            if (prev != "https://localhost:44320/Application/")
            {
                TempData.Keep("message");
                TempData.Keep("messageClass");
            }
            return View(model);
        }

        public ActionResult Detail(int? id)
        {
            var model = db.SAMS_StudentApplications.ToList();

            foreach (var a in model)
            {
                var dep = db.SAMS_Department.Find(a.DepartmentId);
                if (dep != null)
                {
                    a.DepartmentName = dep.DepartmentName;
                }

                var prog = db.SAMS_Program.Find(a.ProgramId);
                if (prog != null)
                {
                    a.ProgramName = prog.ProgramName;
                }

                var statusName = db.SAMS_ApplicationStatus.Find(a.Status);
                if (statusName != null)
                {
                    a.StatusName = statusName.StatusName;
                }

            }
            if (id != null)
            {
                var application = db.SAMS_StudentApplications.Find(id);
                var files = db.SAMS_Files.Where(x => x.StudentApplicationId == id).ToList();
                bool isFileMissing = false;
                if (application.ProgramId == 2)
                {
                    if (files.Count != 5)
                    {
                        isFileMissing = true;
                    }
                }
                if (application.ProgramId == 1)
                {
                    if (files.Count != 8)
                    {
                        isFileMissing = true;
                    }
                }
                if (application.ProgramId == 3)
                {
                    if (files.Count != 9)
                    {
                        isFileMissing = true;
                    }
                }
                if (files != null)
                {
                    ViewBag.IsEducationalInfoEntered = "true";
                    foreach (var a in files)
                    {
                        if (a.FileName.Contains("HighSchoolTranscript"))
                        {
                            application.highSchoolTranscriptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("ResidencePermit"))
                        {
                            application.residencePermitContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("EquivalenceCertificate"))
                        {
                            application.equivalenceCertificateContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("HighSchoolDiploma"))
                        {
                            application.highSchoolDiplomaContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("StudentPhoto"))
                        {
                            application.studentPhotoContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("InternationalExamScore"))
                        {
                            application.internationalExamScoreContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("CopyofPassportorIDCard"))
                        {
                            application.IdorPassportCopyContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("EnglishLanguageProficiencyScore"))
                        {
                            application.englishLanguageProfScoreContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("CV"))
                        {
                            application.cvContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("BachelorDiploma"))
                        {
                            application.bachelorDiplomaContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("BachelorTranscript"))
                        {
                            application.bachelorTranscriptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("MasterDiploma"))
                        {
                            application.masterDiplomaContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("MasterTranscript"))
                        {
                            application.masterTranscriptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("ReferenceLetter1"))
                        {
                            application.referenceLetter1ContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("ReferenceLetter2"))
                        {
                            application.referenceLetter2ContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }
                        else if (a.FileName.Contains("BankReceipt"))
                        {
                            application.bankReceiptContentResult = File(a.FileData, MimeMapping.GetMimeMapping(a.FileName), a.FileName);
                        }

                    }
                }
                ViewBag.isFileMissing = isFileMissing.ToString();
                return View(application);
            }
            else
            {
                return RedirectToAction("Index");
            }
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

        public FileResult DownloadAllFiles(int id)
        {
            var app = db.SAMS_StudentApplications.Find(id);
            string fileDownloadName = app.StudentFirstName + " " + app.StudentLastName + " " + app.CreatedTime + ".zip";
            var files = db.SAMS_Files.Where(x => x.StudentApplicationId == id).ToList();
            if (files.Count > 0)
            {
                using (var memStream = new MemoryStream())
                {
                    using (var archive = new ZipArchive(memStream, ZipArchiveMode.Create, true))
                    {
                        foreach (var file in files)
                        {
                            var zip = archive.CreateEntry(file.FileName.ToString());
                            using (var stream = zip.Open())
                            {
                                stream.Write(file.FileData, 0, file.FileData.Length);
                            }
                        }
                    }
                    return File(memStream.ToArray(), "application/zip", fileDownloadName.Replace(" ", "_"));
                }
            }
            return null;
        }

        [HttpGet]
        public ActionResult MeetingLink(int? Id)
        {
            if (Id != null)
            {
                var application = db.SAMS_StudentApplications.Find(Id);
                return View(application);
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public ActionResult MeetingLink(SAMS_StudentApplications app)
        {
            var application = db.SAMS_StudentApplications.Find(app.Id);
            if (application != null)
            {
                application.MeetingLink = app.MeetingLink;
                application.MeetingDate = app.MeetingDate;
                application.MeetingDateTime = app.MeetingDateTime;
                var email = new MimeMessage();
                var from = "SAMS SAMS";
                var subject = "SAMS info - Application Status Update";
                email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                email.To.Add(new MailboxAddress(application.Email, application.Email));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = @"<h1> As the SAMS team, </h1>" +
                    @"<h3>In the process of your application the head of department wants to have a meeting with you at the given time and day.</h3>" +
                    @"<br/>" +
                    @"<p>Meeting Date: " + application.MeetingDate.ToString("dd/MM/yyyy") + "<p>" +
                    @"<p>Time: " + application.MeetingDateTime.ToString("HH.mm") + "</p>" +
                    @"<br/>" +
                    @"<p>Meeting Link: " + application.MeetingLink + "</p>" +
                    @"<br/>" +
                    @"<p>Don't be late!</p>" +
                    @"<br/>"
                };

                using (SmtpClient smtp = new SmtpClient())
                {
                    smtp.Connect("smtp.gmail.com", 465, true);
                    smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                    smtp.Send(email);
                    smtp.Disconnect(true);
                    TempData["IsMailSent"] = "true";
                }
                return RedirectToAction("Index");
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        [HttpGet]
        public ActionResult Scholarship(int? Id)
        {
            var application = db.SAMS_StudentApplications.Find(Id);
            if (application != null)
            {
                ViewBag.ScholarshipOptions = new SelectList(
                new List<SelectListItem> {
                   new SelectListItem { Text = "100%", Value = "100%" },
                   new SelectListItem { Text = "75%", Value =  "75%" },
                   new SelectListItem { Text = "50%", Value = "50%" },
                   new SelectListItem { Text = "25%", Value =  "25%" },
                   new SelectListItem { Text = "No scholarship", Value =  "No scholarship" },
                }, "Value", "Text");
                return View(application);
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public ActionResult Scholarship(SAMS_StudentApplications app)
        {
            var application = db.SAMS_StudentApplications.Find(app.Id);
            if (application != null)
            {
                application.Scholarship = app.Scholarship;
                application.Status = 4;
                application.ApprovedBy = Convert.ToInt32(Session["UserId"]);
                db.SaveChanges();
                var dep = db.SAMS_Department.Find(application.DepartmentId);
                if (dep != null)
                {
                    application.DepartmentName = dep.DepartmentName;
                }
                var email = new MimeMessage();
                var from = "SAMS SAMS";
                var subject = "SAMS info - Application Status Update";
                email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                email.To.Add(new MailboxAddress(application.Email, application.Email));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = @"<h1> As the SAMS team, </h1>" +
                    @"<h3>We are happy to say that your application has been passed the second phase of the enrollment process.</h3>" +
                    @"<br/>" +
                    @"<p>Your application has been approved by the Head of the Department: " + application.DepartmentName.ToString() + " you have selected with scholarship of " + application.Scholarship.ToString() + ".</p>" +
                    @"<p></p>" +
                    @"<br/>" +
                    @"<p>You will be enrolled in a later day.</p>" +
                    @"<br/>" +
                     @"<p>Please stay tuned.</p>" +
                    @"<br/>"
                };

                using (SmtpClient smtp = new SmtpClient())
                {
                    smtp.Connect("smtp.gmail.com", 465, true);
                    smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                    smtp.Send(email);
                    smtp.Disconnect(true);
                    TempData["IsMailSent"] = "true";
                }
                TempData["Message"] = "Succesfully approved.";
                TempData["messageClass"] = "alert-success";
                TempData.Keep("Message");
                TempData.Keep("messageClass");
                return RedirectToAction("Index");
            }
            else
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
                TempData.Keep("Message");
                TempData.Keep("messageClass");
                return RedirectToAction("Index");
            }
        }

        public ActionResult ApprovalMessage()
        {
            if (TempData["isDeleted"] != null)
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            else
            {
                TempData["Message"] = "Succesfully approved.";
                TempData["messageClass"] = "alert-success";
            }
            TempData.Keep("Message");
            TempData.Keep("messageClass");
            return RedirectToAction("Index");
        }

        public JsonResult Approval(int? id)
        {
            bool result = false;
            var applications = db.SAMS_StudentApplications.Find(id);
            var dep = db.SAMS_Department.Find(applications.DepartmentId);
            if (dep != null)
            {
                applications.DepartmentName = dep.DepartmentName;
            }

            var prog = db.SAMS_Program.Find(applications.ProgramId);
            if (prog != null)
            {
                applications.ProgramName = prog.ProgramName;
            }

            if (applications != null)
            {
                var user = db.SAMS_Users.Find(Convert.ToInt32(Session["UserId"]));
                applications.Status = 2;
                applications.ApprovedBy = Convert.ToInt32(Session["UserId"]);
                db.SaveChanges();
                var email = new MimeMessage();
                var from = "SAMS SAMS";
                var subject = "SAMS info - Application Status Update";
                email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = @"<h1> As the SAMS team, </h1>" +
                    @"<h3>We are happy to say that your application has been passed the first phase of the enrollment process.</h3>" +
                    @"<br/>" +
                    @"<p>Your application has been approved by the secretary of the Department: " + applications.DepartmentName.ToString() + " and Program: " + applications.ProgramName.ToString() + " you have selected.</p>" +
                    @"<br/>" +
                    @"<p>The application is on the evaluation process of the Head of the " + applications.DepartmentName + " department.</p>" +
                    @"<br/>" +
                     @"<p>Please stay tuned.</p>" +
                    @"<br/>"
                };

                using (SmtpClient smtp = new SmtpClient())
                {
                    smtp.Connect("smtp.gmail.com", 465, true);
                    smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                    smtp.Send(email);
                    smtp.Disconnect(true);
                    TempData["IsMailSent"] = "true";
                }
                result = true;
            }
            else
            {
                TempData["isApprovedBySecretary"] = false;
                TempData["isApprovedByHoD"] = false;
                TempData.Keep("isApprovedBySecretary");
                TempData.Keep("isApprovedByHoD");
            }
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RejectMessage()
        {
            if (TempData["isDeleted"] != null)
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            else
            {
                TempData["Message"] = "Succesfully Rejected.";
                TempData["messageClass"] = "alert-success";
            }
            TempData.Keep("Message");
            TempData.Keep("messageClass");
            return RedirectToAction("Index");
        }

        public JsonResult Reject(int? id)
        {
            bool result = false;
            var applications = db.SAMS_StudentApplications.Find(id);
            if (applications != null)
            {
                var user = db.SAMS_Users.Find(Convert.ToInt32(Session["UserId"]));
                if (user.UserType == 1)
                {
                    applications.Status = 5;
                    applications.RejectedBy = Convert.ToInt32(Session["UserId"]);
                    db.SaveChanges();
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - E-Mail Verification";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                    email.Subject = subject;
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>We are really sorry to tell you that your application has been rejected.</h3>" +
                        @"<br/>" +
                        @"<p></p>" +
                        @"<br/>"
                    };

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
                    applications.Status = 5;
                    applications.RejectedBy = Convert.ToInt32(Session["UserId"]);
                    db.SaveChanges();
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - E-Mail Verification";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                    email.Subject = subject;
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>We are really sorry to tell you that your application has been rejected.</h3>" +
                        @"<br/>" +
                        @"<p>Even tho you have been passed the previous phase. Your application wasn't met the standards of the second phase.</p>" +
                        @"<br/>"
                    };

                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Connect("smtp.gmail.com", 465, true);
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                        smtp.Send(email);
                        smtp.Disconnect(true);
                        TempData["IsMailSent"] = "true";
                    }
                }
                result = true;
            }
            else
            {
                TempData["isApprovedBySecretary"] = false;
                TempData["isApprovedByHoD"] = false;
                TempData.Keep("isApprovedBySecretary");
                TempData.Keep("isApprovedByHoD");
            }
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult MissingFilesMessage()
        {
            if (TempData["isDeleted"] != null)
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            else
            {
                TempData["Message"] = "Mail Successfully Sent.";
                TempData["messageClass"] = "alert-success";
            }
            TempData.Keep("Message");
            TempData.Keep("messageClass");
            return RedirectToAction("Index");
        }

        public JsonResult RequestMissingFiles(int? id)
        {
            bool result = false;
            var applications = db.SAMS_StudentApplications.Find(id);
            if (applications != null)
            {
                var user = db.SAMS_Users.Find(Convert.ToInt32(Session["UserId"]));
                if (user.UserType == 1)
                {
                    applications.Status = 3;
                    applications.RejectedBy = Convert.ToInt32(Session["UserId"]);
                    db.SaveChanges();
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - Missing Application Files";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                    email.Subject = subject;
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>Your application has some missing files. </h3>" +
                        @"<br/>" +
                        @"<p>Please a click below link to edit your application and upload the missing documents.</p>" +
                        @"<br/>" +
                        @"<a href='" + System.Configuration.ConfigurationManager.AppSettings["ProjectDirectory"] + "/StudentApplication/AuthenticateGuid?guid=" + applications.GUID + "'>Click here.</a>"
                    };

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
                    //applications.Status = 5;
                    applications.RejectedBy = Convert.ToInt32(Session["UserId"]);
                    db.SaveChanges();
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - E-Mail Verification";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                    email.Subject = subject;
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>We are really sorry to tell you that your application has been rejected.</h3>" +
                        @"<br/>" +
                        @"<p>Even tho you have been passed the previous phase. Your application wasn't met the standards of the second phase.</p>" +
                        @"<br/>"
                    };

                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Connect("smtp.gmail.com", 465, true);
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                        smtp.Send(email);
                        smtp.Disconnect(true);
                        TempData["IsMailSent"] = "true";
                    }
                }
                result = true;
            }
            else
            {
                TempData["isApprovedBySecretary"] = false;
                TempData["isApprovedByHoD"] = false;
                TempData.Keep("isApprovedBySecretary");
                TempData.Keep("isApprovedByHoD");
            }
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult RequestPaymentMessage()
        {
            if (TempData["isDeleted"] != null)
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            else
            {
                TempData["Message"] = "Mail Successfully Sent.";
                TempData["messageClass"] = "alert-success";
            }
            TempData.Keep("Message");
            TempData.Keep("messageClass");
            return RedirectToAction("Index");
        }

        public JsonResult RequestPayment(int? id)
        {
            bool result = false;
            var applications = db.SAMS_StudentApplications.Find(id);
            var bankReceipt = db.SAMS_Files.Where(x => x.StudentApplicationId == applications.Id &&
                                                       x.FileName.Contains("BankReceipt")).FirstOrDefault();

            if (applications != null)
            {
                if (bankReceipt == null)
                {
                    applications.Status = 7;
                    db.SaveChanges();
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - Awaiting Payment";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                    email.Subject = subject;
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>Your application has been approved by the head of department. To enroll you to our institude we need the enrollement fee first. </h3>" +
                        @"<br/>" +
                        @"<p>IBAN NO: BANK IBAN NO HERE</p>" +
                        @"<br/>" +
                        @"<p>After paying the fee please upload the bank receipt to the link given below.</p>" +
                        @"<br/>" +
                        @"<a href='" + System.Configuration.ConfigurationManager.AppSettings["ProjectDirectory"] + "/StudentApplication/AuthenticateGuidForBankReceipt?guid=" + applications.GUID + "'>Click here to upload the bank receipt.</a>"
                    };

                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Connect("smtp.gmail.com", 465, true);
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                        smtp.Send(email);
                        smtp.Disconnect(true);
                        TempData["IsMailSent"] = "true";
                    }
                    result = true;
                } else
                {
                    applications.Status = 7;
                    db.SaveChanges();
                    var email = new MimeMessage();
                    var from = "SAMS SAMS";
                    var subject = "SAMS info - Awaiting Payment";
                    email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                    email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                    email.Subject = subject;
                    email.Body = new TextPart(TextFormat.Html)
                    {
                        Text = @"<h1> As the SAMS team, </h1>" +
                        @"<h3>Your application has been approved by the head of department. To enroll you to our institude we need the enrollement fee first. </h3>" +
                        @"<br/>" +
                        @"<p>Your previously uploaded bank receipt wasn't confirmed by us. Please upload the bank receipt again from the link given below. </p>" +
                        @"<br/>" +
                        @"<a href='" + System.Configuration.ConfigurationManager.AppSettings["ProjectDirectory"] + "/StudentApplication/AuthenticateGuidForBankReceipt?guid=" + applications.GUID + "'>Click here to upload the bank receipt.</a>"
                    };

                    using (SmtpClient smtp = new SmtpClient())
                    {
                        smtp.Connect("smtp.gmail.com", 465, true);
                        smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                        smtp.Send(email);
                        smtp.Disconnect(true);
                        TempData["IsMailSent"] = "true";
                    }
                    result = true;
                }
                
            }
            else
            {
                TempData["isApprovedBySecretary"] = false;
                TempData["isApprovedByHoD"] = false;
                TempData.Keep("isApprovedBySecretary");
                TempData.Keep("isApprovedByHoD");
            }
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult EnrollMessage()
        {
            if (TempData["isDeleted"] != null)
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            else
            {
                TempData["Message"] = "Enrollment Mail Successfully Sent.";
                TempData["messageClass"] = "alert-success";
            }
            TempData.Keep("Message");
            TempData.Keep("messageClass");
            return RedirectToAction("Index");
        }

        public JsonResult Enroll(int? id)
        {
            bool result = false;
            var applications = db.SAMS_StudentApplications.Find(id);
            if (applications != null)
            {
                applications.Status = 6;
                applications.EnrolledBy = Convert.ToInt32(Session["UserId"]);
                db.SaveChanges();
                var email = new MimeMessage();
                var from = "SAMS SAMS";
                var subject = "SAMS info - Enrollment Mail";
                email.From.Add(new MailboxAddress(from, "samsinfo.noreply@gmail.com"));
                email.To.Add(new MailboxAddress(applications.Email, applications.Email));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html)
                {
                    Text = @"<h1> As the SAMS team, </h1>" +
                    @"<h3>Your application has been approved by the head of department, your payment have been confirmed.</h3>" +
                    @"<br/>" +
                    @"<p>You are offically a student of our institue.</p>" +
                    @"<br/>" +
                    @"<p>Thank you for your application and have a wonderful time.</p>"
                };

                using (SmtpClient smtp = new SmtpClient())
                {
                    smtp.Connect("smtp.gmail.com", 465, true);
                    smtp.Authenticate("samsinfo.noreply@gmail.com", "qultbqdkozwvfhgt");
                    smtp.Send(email);
                    smtp.Disconnect(true);
                    TempData["IsMailSent"] = "true";
                }
                result = true;
            }
            else
            {
                TempData["isApprovedBySecretary"] = false;
                TempData["isApprovedByHoD"] = false;
                TempData.Keep("isApprovedBySecretary");
                TempData.Keep("isApprovedByHoD");
            }
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}