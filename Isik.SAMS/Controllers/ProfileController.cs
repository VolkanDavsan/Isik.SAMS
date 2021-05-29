using Isik.SAMS.Models.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

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
                if(user.UserType == 1)
                {
                    var dep = db.SAMS_Department.Find(user.DepartmentId);
                    var prog = db.SAMS_Program.Find(user.ProgramId);
                    ViewBag.DepartmentName = dep.DepartmentName;
                    ViewBag.ProgramName = prog.ProgramName;
                } else
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