using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;

namespace Isik.SAMS.Controllers
{
    public class ProgramController : Controller
    {
        // GET: Program
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        public ActionResult Index()
        {
            var values = db.SAMS_Program.ToList();
            return View(values);
        }
        [HttpGet]
        public ActionResult Insert()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Program s1)
        {
            s1.CreatedBy = 1; // adminId when the session created
            s1.CreatedTime = DateTime.Now;
            db.SAMS_Program.Add(s1);
            db.SaveChanges();

            return View(); // RedirectToAction("Index");
        }
    }
}