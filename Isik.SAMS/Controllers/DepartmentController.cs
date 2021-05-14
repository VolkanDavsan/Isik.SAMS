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
        public string setMessage(string alertMessage)
        {
            string message = "";

            if (alertMessage == "1")
            {
                message = "Succesfully inserted.";
            }
            else if (alertMessage == "2")
            {
                message = "Succesfully deleted.";
            }
            else if (alertMessage == "3")
            {
                message = "Succesfully updated.";
            }
            else if (alertMessage == "4")
            {
                message = "Operation failed.";
            }
            return message;
        }
        public ActionResult Index()
        {            
            var values = db.SAMS_Department.ToList();
            ViewBag.Message = TempData["message"] == null ? null : setMessage(TempData["message"].ToString());
            return View(values);
        }
        [HttpGet]
        public ActionResult Insert()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Department s1)
        {
            s1.CreatedBy = 1; //session adminId
            s1.CreatedTime = DateTime.Now;
            db.SAMS_Department.Add(s1);
            db.SaveChanges();
            TempData["Message"] = "1";
            return RedirectToAction("Index");
        }
        public ActionResult DeleteMessage()
        {
            TempData["Message"] = "2";
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
            return Json(result, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public ActionResult Update(int Id)
        {
            var department = db.SAMS_Department.Find(Id);  
            return View(department);
        }

        [HttpPost]
        public ActionResult Update(SAMS_Department s1)
        {
            var department = db.SAMS_Department.Find(s1.Id);
            department.DepartmentName = s1.DepartmentName;
            department.CreatedTime = s1.CreatedTime;
            db.SaveChanges();
            TempData["Message"] = "3";
            return RedirectToAction("Index");
        }
    }
}