using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;

namespace Isik.SAMS.Controllers
{
    public class AccountController : Controller
    {
        // GET: Account
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        public ActionResult Index()
        {
            var model = db.SAMS_Users.Where(x => x.UserType != 3).ToList();
            foreach (var a in model)
            {
                var dep = db.SAMS_Department.Find(a.DepartmentId);
                a.DepartmentName = dep.DepartmentName;
                
                var prog = db.SAMS_Program.Find(a.ProgramId);
                if(prog != null)
                {
                    a.ProgramName = prog.ProgramName;
                } else
                {
                    a.ProgramName = "None";
                }            
            }
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
            return View(model);
        }
        [HttpGet]
        public ActionResult Insert()
        {
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            Dictionary<int, string> dicUserTypes = new Dictionary<int, string>();
            List<SAMS_UserType> userTypeList = db.SAMS_UserType.ToList<SAMS_UserType>();
            foreach (SAMS_UserType a in userTypeList)
            {
                dicUserTypes.Add(a.Id, a.UserTypeName);
            }
            ViewBag.UserTypes = dicUserTypes;
            return View();
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Users s1)
        {
            var user = db.SAMS_Users.Where(x => x.Email == s1.Email).FirstOrDefault();
            if (user != null)
            {
                TempData["Message"] = "There is a user with E-Mail '" + user.Email + "' already.";
                TempData["messageClass"] = "alert-warning";
                return RedirectToAction("Index");
            }
            else
            {
                if(s1.Password != s1.ConfirmPassword)
                {
                    TempData["Message"] = "New Password and Confirm Password do not match.";
                    TempData["messageClass"] = "alert-warning";
                } else
                {
                    s1.CreatedBy = Convert.ToInt32(Session["AdminId"]); // adminId when the session created
                    s1.CreatedTime = DateTime.Now;
                    if (s1.UserType == 2)
                    {
                        s1.ProgramId = null;
                    }
                    db.SAMS_Users.Add(s1);
                    db.SaveChanges();
                    TempData["Message"] = "Succesfully inserted.";
                    TempData["messageClass"] = "alert-success";
                }

                return RedirectToAction("Index");
            }
        }
        public ActionResult DeleteMessage()
        {
            if (TempData["isDeleted"] != null)
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            else
            {
                TempData["Message"] = "Succesfully deleted.";
                TempData["messageClass"] = "alert-success";
            }

            TempData.Keep("Message");
            return RedirectToAction("Index");
        }
        [HttpGet]
        public ActionResult Delete()
        {
            TempData["Message"] = "Operation failed.";
            TempData["messageClass"] = "alert-danger";
            return RedirectToAction("Index");
        }
        public JsonResult Delete(int? id)
        {
            bool result = false;
            var user = db.SAMS_Users.Find(id);
            if (user != null)
            {
                db.SAMS_Users.Remove(user);
                db.SaveChanges();
                result = true;
            }
            else
            {
                TempData["isDeleted"] = false;
                TempData.Keep("isDeleted");
            }
            return Json(result, JsonRequestBehavior.AllowGet);

        }

        [HttpGet]
        public ActionResult Update(int? Id)
        {
            if (Id != null)
            {
                var user = db.SAMS_Users.Find(Id);
                ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
                ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
                foreach (SelectListItem a in ViewBag.Departments)
                {
                    if (Convert.ToInt32(a.Value) == user.DepartmentId)
                    {
                        a.Selected = true;
                    }
                }

                if (user.UserType != 2)
                {
                    foreach (SelectListItem a in ViewBag.Programs)
                    {
                        if (Convert.ToInt32(a.Value) == user.ProgramId)
                        {
                            a.Selected = true;
                        }
                    }
                }
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
                if (p1.Password != p1.ConfirmPassword)
                {
                    TempData["Message"] = "New Password and Confirm Password do not match.";
                    TempData["messageClass"] = "alert-warning";
                } else {
                    var user = db.SAMS_Users.Find(p1.Id);
                    user.ChangedTime = DateTime.Now;
                    user.ChangedBy = Convert.ToInt32(Session["AdminId"]);
                    user.FirstName = p1.FirstName;
                    user.LastName = p1.LastName;
                    user.UserType = p1.UserType;
                    user.PhoneNumber = p1.PhoneNumber;
                    user.Email = p1.Email;
                    if (p1.UserType == 2)
                    {
                        p1.ProgramId = null;
                    }
                    user.DepartmentId = p1.DepartmentId;
                    user.ProgramId = p1.ProgramId;
                    if (p1.Password != null)
                    {
                        user.Password = p1.Password;
                    }
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