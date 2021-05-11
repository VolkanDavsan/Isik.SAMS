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
            
            var values = db.SAMS_Department.ToList();
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
            s1.CreatedTime = DateTime.Now;
            db.SAMS_Department.Add(s1);
            db.SaveChanges();
            

            return RedirectToAction("Index");
            
        }
        public ActionResult Delete(int id)
        {
            var department = db.SAMS_Department.Find(id);
            db.SAMS_Department.Remove(department);
            db.SaveChanges();
            return RedirectToAction("Index");
        }
        [HttpGet]
        public ActionResult Update()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Update(SAMS_Department s1)
        {
            var department = db.SAMS_Department.Find(s1.Id);
            department.DepartmentName = s1.DepartmentName;
            department.CreatedTime = s1.CreatedTime;
            db.SaveChanges();
            return RedirectToAction("Index");
            

        }
    }
}