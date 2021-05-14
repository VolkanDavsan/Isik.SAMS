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
            var model = db.SAMS_Program.ToList();
            ViewBag.Message = TempData["message"] == null ? null : setMessage(TempData["message"].ToString());
            return View(model);
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
            var program = db.SAMS_Program.Find(id);
            if(program != null)
            {
                db.SAMS_Program.Remove(program);
                db.SaveChanges();
                result = true;
            }
            return Json(result, JsonRequestBehavior.AllowGet);
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
            TempData["Message"] = "3";
            return RedirectToAction("Index");
        }
    }
}