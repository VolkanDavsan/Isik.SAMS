using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;


namespace Isik.SAMS.Controllers
{
    public class ProfileController : Controller
    {
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        // GET: Profile
        public ActionResult Index()
        {
            var user = db.SAMS_Users.Find(Session["UserId"]);
            if (user == null)
            {
                user = db.SAMS_Users.Find(Session["AdminId"]);
            }
            else
            {
                if (user.UserType == 1)
                {
                    var dep = db.SAMS_Department.Find(user.DepartmentId);
                    var prog = db.SAMS_Program.Find(user.ProgramId);
                    ViewBag.DepartmentName = dep.DepartmentName;
                    ViewBag.ProgramName = prog.ProgramName;
                }
                else
                {
                    var dep = db.SAMS_Department.Find(user.DepartmentId);
                    ViewBag.DepartmentName = dep.DepartmentName;
                }

            }

            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
            return View();
        }

        [HttpGet]
        public ActionResult Update(int? Id)
        {
            if (Id != null)
            {
                var user = db.SAMS_Users.Find(Id);
                return View(user);
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public ActionResult Update(SAMS_Users p1)
        {
            if (p1 != null)
            {
                var user = db.SAMS_Users.Find(p1.Id);
                if (p1.profilePhoto != null)
                {
                    if (p1.profilePhoto.ContentLength < 10000000)
                    {
                        string newFileName = user.FirstName + "" + user.LastName + "" + user.Id;
                        var file = new SAMS_Files();
                        var prevpp = db.SAMS_Files.Find(user.ProfilePhotoId);
                        if (prevpp == null)
                        {
                            file.FileCreateDate = DateTime.Now;
                            string fileName = Path.GetFileName(p1.profilePhoto.FileName);
                            file.FileName = newFileName + "" + Path.GetExtension(fileName);
                            file.FileExtension = Path.GetExtension(file.FileName);
                            byte[] fileData = new byte[p1.profilePhoto.InputStream.Length];
                            p1.profilePhoto.InputStream.Read(fileData, 0, fileData.Length);
                            file.FileData = fileData;
                            file.StudentApplicationId = null;
                            if (file.FileExtension == ".jpg" || file.FileExtension == ".jpeg" || file.FileExtension == ".png")
                            {
                                TempData["FilesUploaded"] = "true";
                                db.SAMS_Files.Add(file);
                                db.SaveChanges();
                                var pp = db.SAMS_Files.Where(x => x.FileName == newFileName + "" + file.FileExtension).FirstOrDefault();
                                var user1 = new SAMS_Users();
                                if (Session["UserId"] != null)
                                {
                                    user1 = db.SAMS_Users.Find(Convert.ToInt32(Session["UserId"]));
                                }
                                else if (Session["AdminId"] != null)
                                {
                                    user1 = db.SAMS_Users.Find(Convert.ToInt32(Session["AdminId"]));
                                }
                                user1.ProfilePhotoId = pp.Id;
                                TempData["Message"] = "Succesfully updated";
                                TempData["messageClass"] = "alert-success";
                                db.SaveChanges();
                                Session["ProfilePhoto"] = "data:" + "" + MimeMapping.GetMimeMapping(pp.FileName) + ";base64," + Convert.ToBase64String(pp.FileData);
                            }
                            else
                            {
                                TempData["Message"] = "Only jpg/jpeg, png files are allowed!"; ;
                                TempData["messageClass"] = "alert-warning";
                            }
                        }
                        else
                        {
                            var newExtension = Path.GetExtension(p1.profilePhoto.FileName);
                            if (newExtension == ".jpg" || newExtension == ".jpeg" || newExtension == ".png")
                            {
                                prevpp.FileCreateDate = DateTime.Now;
                                string fileName = Path.GetFileName(p1.profilePhoto.FileName);
                                prevpp.FileName = newFileName + "" + Path.GetExtension(fileName);
                                prevpp.FileExtension = Path.GetExtension(prevpp.FileName);
                                byte[] fileData = new byte[p1.profilePhoto.InputStream.Length];
                                p1.profilePhoto.InputStream.Read(fileData, 0, fileData.Length);
                                prevpp.FileData = fileData;
                                prevpp.StudentApplicationId = null;
                                TempData["FilesUploaded"] = "true";
                                db.SaveChanges();
                                var pp = db.SAMS_Files.Where(x => x.FileName == newFileName + "" + prevpp.FileExtension).FirstOrDefault();
                                var user1 = new SAMS_Users();
                                if (Session["UserId"] != null)
                                {
                                    user1 = db.SAMS_Users.Find(Convert.ToInt32(Session["UserId"]));
                                }
                                else if (Session["AdminId"] != null)
                                {
                                    user1 = db.SAMS_Users.Find(Convert.ToInt32(Session["AdminId"]));
                                }
                                user1.ProfilePhotoId = pp.Id;
                                TempData["Message"] = "Succesfully updated";
                                TempData["messageClass"] = "alert-success";
                                db.SaveChanges();
                                Session["ProfilePhoto"] = "data:" + "" + MimeMapping.GetMimeMapping(pp.FileName) + ";base64," + Convert.ToBase64String(pp.FileData);
                            }
                            else
                            {
                                TempData["Message"] = "Only jpg/jpeg, png files are allowed!"; ;
                                TempData["messageClass"] = "alert-warning";
                            }
                        }
                    }
                    else
                    {
                        TempData["Message"] = "Maximum file size is 10 MB.";
                        TempData["messageClass"] = "alert-warning";
                    }
                }

                if (p1.NewPassword != null)
                {
                    if (user.Password == p1.NewPassword)
                    {
                        TempData["Message"] = "Your new password cannot be the same as the old password.";
                        TempData["messageClass"] = "alert-warning";
                    }
                    else if (p1.NewPassword != p1.ConfirmPassword)
                    {
                        TempData["Message"] = "New Password and Confirm Password do not match.";
                        TempData["messageClass"] = "alert-warning";
                    }
                    else if (user.Password != p1.Password)
                    {
                        TempData["Message"] = "The entered current password is wrong.";
                        TempData["messageClass"] = "alert-warning";
                    }
                    else
                    {
                        user.Password = p1.NewPassword;
                        db.SaveChanges();
                        TempData["Message"] = "Succesfully updated.";
                        TempData["messageClass"] = "alert-success";
                    }
                }

                return RedirectToAction("Index");
            }
            else
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
                return RedirectToAction("Index");
            }
        }

    }
}