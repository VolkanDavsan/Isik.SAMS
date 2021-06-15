using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;

namespace Isik.SAMS.Controllers
{
    public class DepartmentController : Controller
    {
        // GET: Department
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
            else
            {
                var values = db.SAMS_Department.ToList();
                ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
                ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
                return View(values);
            }
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
            else
            {
                return View();
            }
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Department s1)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            else
            {
                var department = db.SAMS_Department.Where(x => x.DepartmentName == s1.DepartmentName).FirstOrDefault();
                if (department != null)
                {
                    TempData["Message"] = "There is a department named " + department.DepartmentName + " already.";
                    TempData["messageClass"] = "alert-warning";
                    return RedirectToAction("Index");
                }
                else
                {
                    s1.CreatedBy = Convert.ToInt32(Session["AdminId"]); //session adminId
                    s1.CreatedTime = DateTime.Now;
                    db.SAMS_Department.Add(s1);
                    db.SaveChanges();
                    TempData["Message"] = "Succesfully inserted";
                    TempData["messageClass"] = "alert-success";
                    return RedirectToAction("Index");
                }
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
        public JsonResult Delete(int id)
        {
            bool result = false;
            var department = db.SAMS_Department.Find(id);
            if (department != null)
            {
                db.SAMS_Department.Remove(department);
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
            else
            {
                if (Id != null)
                {
                    var department = db.SAMS_Department.Find(Id);
                    return View(department);
                }
                else
                {
                    return RedirectToAction("Index");
                }
            }
        }

        [HttpPost]
        public ActionResult Update(SAMS_Department s1)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            else
            {
                var department = db.SAMS_Department.Find(s1.Id);
                var dep = db.SAMS_Department.Where(x => x.DepartmentName == s1.DepartmentName).FirstOrDefault();
                if(dep == null)
                {
                    if (department != null)
                    {
                        if (s1 != null)
                        {
                            department.DepartmentName = s1.DepartmentName;
                            department.ChangedTime = DateTime.Now;
                            department.ChangedBy = Convert.ToInt32(Session["AdminId"]);
                            db.SaveChanges();
                            TempData["Message"] = "Succesfully updated.";
                            TempData["messageClass"] = "alert-success";
                        }
                        else
                        {
                            TempData["Message"] = "Operation failed.";
                            TempData["messageClass"] = "alert-danger";
                        }
                    }
                } else
                {
                    TempData["Message"] = "There is a department named " + dep.DepartmentName + " already.";
                    TempData["messageClass"] = "alert-warning";
                }
                
                return RedirectToAction("Index");
            }
        }
    }
}