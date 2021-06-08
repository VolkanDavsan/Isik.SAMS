using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;
using System.Data;

namespace Isik.SAMS.Controllers
{

    public class ApplicationController : Controller
    {
        StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
        // GET: Application
        public ActionResult Index()
        {
            var model = db.SAMS_StudentApplications.ToList();
            return View(model);
        }
        public ActionResult Detail(int? id)
        {
            var model = db.SAMS_StudentApplications.ToList();
           
            foreach (var a in model)
            {
                var dep = db.SAMS_Department.Find(a.DepartmentId);
                if(dep != null)
                {
                    a.DepartmentName = dep.DepartmentName;
                }

                var prog = db.SAMS_Program.Find(a.ProgramId);
                if(prog != null)
                {
                    a.ProgramName = prog.ProgramName;
                }

            }
            if (id != null)
            {
                var application = db.SAMS_StudentApplications.Find(id);
                return View(application);
            }
            else
            {
                return RedirectToAction("Index");
            }
        }
    }
}