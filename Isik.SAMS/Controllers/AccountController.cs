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
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }

            var model = db.SAMS_Users.Where(x => x.UserType != 3).ToList();
            foreach (var a in model)
            {
                var dep = db.SAMS_Department.Find(a.DepartmentId);
                a.DepartmentName = dep.DepartmentName;

                var prog = db.SAMS_Program.Find(a.ProgramId);
                if (prog != null)
                {
                    a.ProgramName = prog.ProgramName;
                }
                else
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
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            var departments = db.SAMS_DepartmentProgramRel.ToList();
            return View();
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Users s1)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            var user = db.SAMS_Users.Where(x => x.Email == s1.Email).FirstOrDefault();
            if (user != null)
            {
                TempData["Message"] = "There is a user with E-Mail '" + user.Email + "' already.";
                TempData["messageClass"] = "alert-warning";
                return RedirectToAction("Index");
            }
            else
            {
                var depProgs = db.SAMS_DepartmentProgramRel.Where(x => x.DepartmentId == s1.DepartmentId && x.ProgramId == s1.ProgramId).FirstOrDefault();
                if (depProgs != null || s1.UserType == 2)
                {
                    if (s1.Password != s1.ConfirmPassword)
                    {
                        TempData["Message"] = "New Password and Confirm Password do not match.";
                        TempData["messageClass"] = "alert-warning";
                    }
                    else
                    {
                        var a = s1.DepartmentId.ToString();
                        s1.CreatedBy = Convert.ToInt32(Session["AdminId"]); // adminId when the session created
                        s1.CreatedTime = DateTime.Now;
                        if (s1.UserType == 2)
                        {
                            var hod = db.SAMS_Users.Where(x => x.DepartmentId == s1.DepartmentId && x.UserType == s1.UserType).FirstOrDefault();
                            if (hod == null)
                            {
                                s1.ProgramId = null;
                            }
                            else
                            {
                                TempData["Message"] = "There could only be one Head of Department per department.";
                                TempData["messageClass"] = "alert-warning";
                                return RedirectToAction("Index");
                            }
                        }
                        db.SAMS_Users.Add(s1);
                        db.SaveChanges();
                        TempData["Message"] = "Succesfully inserted.";
                        TempData["messageClass"] = "alert-success";
                    }
                }
                else
                {
                    TempData["Message"] = "Selected Department does not have a program of your selection";
                    TempData["messageClass"] = "alert-warning";
                }
                return RedirectToAction("Index");
            }
        }
        public ActionResult DeleteMessage()
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
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
        public JsonResult Delete(int? id)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                Response.Redirect("/Application/Index");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                Response.Redirect("/Account/Index");
            }
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
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
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
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            if (p1 != null)
            {
                var depProgs = db.SAMS_DepartmentProgramRel.Where(x => x.DepartmentId == p1.DepartmentId && x.ProgramId == p1.ProgramId).FirstOrDefault();
                if (depProgs != null || p1.UserType == 2)
                {
                    if (p1.Password != p1.ConfirmPassword)
                    {
                        TempData["Message"] = "New Password and Confirm Password do not match.";
                        TempData["messageClass"] = "alert-warning";
                    }
                    else
                    {
                        var user = db.SAMS_Users.Find(p1.Id);
                        var current = db.SAMS_Users.Where(x => x.Email == p1.Email).FirstOrDefault();
                        if (current == null || current.Id == p1.Id)
                        {
                            user.ChangedTime = DateTime.Now;
                            user.ChangedBy = Convert.ToInt32(Session["AdminId"]);
                            user.FirstName = p1.FirstName;
                            user.LastName = p1.LastName;
                            user.UserType = p1.UserType;
                            user.PhoneNumber = p1.PhoneNumber;
                            user.Email = p1.Email;

                            if (p1.UserType == 2)
                            {
                                var hod = db.SAMS_Users.Where(x => x.DepartmentId == p1.DepartmentId && x.UserType == p1.UserType).FirstOrDefault();
                                if (hod == null || hod.Id == p1.Id)
                                {
                                    p1.ProgramId = null;
                                }
                                else
                                {
                                    TempData["Message"] = "There could only be one Head of Department per department.";
                                    TempData["messageClass"] = "alert-warning";
                                    return RedirectToAction("Index");
                                }

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
                        else
                        {
                            TempData["Message"] = "The E-mail is in use.";
                            TempData["messageClass"] = "alert-warning";
                        }
                    }
                    return RedirectToAction("Index");
                }
                else
                {
                    TempData["Message"] = "Selected Department does not have a program of your selection";
                    TempData["messageClass"] = "alert-warning";
                }
            }
            else
            {
                TempData["Message"] = "Operation failed.";
                TempData["messageClass"] = "alert-danger";
            }
            return RedirectToAction("Index");
        }
    }
}