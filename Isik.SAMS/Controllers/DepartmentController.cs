using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
namespace Isik.SAMS.Controllers
{
    public class DepartmentController : Controller
    {
        // GET: Department
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        public ActionResult Index()
        {
            
            var values = db.SAMS_Department.ToList();
            var dep = values.AsEnumerable();
            return View(dep);
        }
        [HttpGet]
        public ActionResult Insert()
        {

            return View();
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Department s1)
        {
            db.SAMS_Department.Add(s1);
            db.SaveChanges();

            return RedirectToAction("Index");
        }
    }
}