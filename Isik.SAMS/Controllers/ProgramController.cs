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
        public ActionResult Delete(int id)
        {
            var program = db.SAMS_Program.Find(id);
            db.SAMS_Program.Remove(program);
            db.SaveChanges();
            return RedirectToAction("Index");
        }
        [HttpGet]
        public ActionResult Update(int Id)
        {
            var program = db.SAMS_Program.Find(Id);            
            return View(program);
        }

        [HttpPost]
        public ActionResult Update(SAMS_Program p1)
        {
            var program = db.SAMS_Program.Find(p1.Id);
            program.ProgramName = p1.ProgramName;
            program.CreatedTime = p1.CreatedTime;
            db.SaveChanges();
            return RedirectToAction("Index");


        }
    }
}