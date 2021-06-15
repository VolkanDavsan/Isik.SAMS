using Isik.SAMS.Models.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Isik.SAMS.Controllers
{
    public class DepartmentProgramController : Controller
    {
        // GET: DepartmentProgram
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
            var values = db.SAMS_DepartmentProgramRel.ToList();
            ViewBag.Message = TempData["message"] == null ? null : TempData["message"].ToString();
            ViewBag.MessageClass = TempData["messageClass"] == null ? null : TempData["messageClass"].ToString();
            return View(values);
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
            return View("Insert");
        }
        [HttpPost]
        public ActionResult Insert(SAMS_DepartmentProgramRel s1)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            var departmentProgram = db.SAMS_DepartmentProgramRel.Where(x => x.DepartmentId == s1.DepartmentId && x.ProgramId == s1.ProgramId).FirstOrDefault();
            if (departmentProgram != null)
            {
                TempData["Message"] = "There is a department named " + departmentProgram.DepartmentName + " with program " + departmentProgram.ProgramName + " already.";
                TempData["messageClass"] = "alert-warning";
                return RedirectToAction("Index");
            }
            else
            {
                if(s1.ProgramId == 1)
                {
                    s1.IsThesisIncluded = true;
                }
                var dep = db.SAMS_Department.Find(s1.DepartmentId);
                var prog = db.SAMS_Program.Find(s1.ProgramId);
                s1.ProgramName = prog.ProgramName;
                s1.DepartmentName = dep.DepartmentName;
                db.SAMS_DepartmentProgramRel.Add(s1);
                db.SaveChanges();
                TempData["Message"] = "Succesfully inserted";
                TempData["messageClass"] = "alert-success";
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
        public JsonResult Delete(int id)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                Response.Redirect("/Application/Index");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                Response.Redirect("/Login/Index");
            }
            bool result = false;
            var department = db.SAMS_DepartmentProgramRel.Find(id);
            if (department != null)
            {
                db.SAMS_DepartmentProgramRel.Remove(department);
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
                var department = db.SAMS_DepartmentProgramRel.Find(Id);
                ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
                ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
                return View(department);
            }
            else
            {
                return RedirectToAction("Index");
            }
        }

        [HttpPost]
        public ActionResult Update(SAMS_DepartmentProgramRel s1)
        {
            if (Session["UserId"] != null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Application");
            }
            else if (Session["UserId"] == null && Session["AdminId"] == null)
            {
                return RedirectToAction("Index", "Login");
            }
            var departmentProgram = db.SAMS_DepartmentProgramRel.Find(s1.Id);
            var dep = db.SAMS_DepartmentProgramRel.Where(x => x.DepartmentId == s1.DepartmentId &&
                                                              x.ProgramId == s1.ProgramId &&
                                                              x.IsThesisIncluded == s1.IsThesisIncluded).FirstOrDefault();
            if (dep == null || departmentProgram.Id == dep.Id)
            {
                if (departmentProgram != null)
                {
                    if (s1.ProgramId == 1)
                    {
                        s1.IsThesisIncluded = true;
                    }
                    var department = db.SAMS_Department.Find(s1.DepartmentId);
                    departmentProgram.DepartmentName = department.DepartmentName;
                    departmentProgram.DepartmentId = department.Id;
                    var program = db.SAMS_Program.Find(s1.ProgramId);
                    departmentProgram.ProgramId = program.Id;
                    departmentProgram.ProgramName = program.ProgramName;
                    departmentProgram.Quota = s1.Quota;
                    departmentProgram.IsThesisIncluded = s1.IsThesisIncluded;
                    departmentProgram.Duration = s1.Duration;
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
            }
            else
            {
                TempData["Message"] = "There is a department named " + dep.DepartmentName + " with program " + dep.ProgramName + " already.";
                TempData["messageClass"] = "alert-warning";
                return RedirectToAction("Index");
            }
        }
    }
}