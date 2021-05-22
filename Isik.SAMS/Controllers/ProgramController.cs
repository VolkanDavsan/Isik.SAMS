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
            var model = db.SAMS_Program.ToList();
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
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
            var program = db.SAMS_Program.Where(x => x.ProgramName == s1.ProgramName).FirstOrDefault();
            if(program != null)
            {
                TempData["Message"] = "There is a program named '" + program.ProgramName + "' already.";
                TempData["messageClass"] = "alert-warning";
                return RedirectToAction("Index");
            } else
            {
                s1.CreatedBy = Convert.ToInt32(Session["AdminId"]); // adminId when the session created
                s1.CreatedTime = DateTime.Now;
                db.SAMS_Program.Add(s1);
                db.SaveChanges();
                TempData["Message"] = "Succesfully inserted.";
                TempData["messageClass"] = "alert-success";
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
        public JsonResult Delete(int id)
        {
            bool result = false;
            var program = db.SAMS_Program.Find(id);
            if (program != null)
            {
                db.SAMS_Program.Remove(program);
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
                var program = db.SAMS_Program.Find(Id);
                return View(program);
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public ActionResult Update(SAMS_Program p1)
        {
            var updatedProgram = db.SAMS_Program.Where(x => x.ProgramName == p1.ProgramName).FirstOrDefault();
            if (updatedProgram == null)
            {
                if (p1 != null)
                {
                    var program = db.SAMS_Program.Find(p1.Id);
                    program.ProgramName = p1.ProgramName;
                    program.ChangedTime = DateTime.Now;
                    program.ChangedBy = Convert.ToInt32(Session["AdminId"]);
                    db.SaveChanges();
                    TempData["Message"] = "Succesfully updated.";
                    TempData["messageClass"] = "alert-success";
                    return RedirectToAction("Index");
                }
                else
                {
                    TempData["Message"] = "Operation failed.";
                    TempData["messageClass"] = "alert-danger";
                    return RedirectToAction("Index");
                }
            } else
            {
                TempData["Message"] = "There is a program named '" + p1.ProgramName + "' already.";
                TempData["messageClass"] = "alert-warning";
                return RedirectToAction("Index");
            }
            
        }
    }
}