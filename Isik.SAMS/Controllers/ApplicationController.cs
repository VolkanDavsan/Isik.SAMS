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
        public ActionResult Detail()
        {
            return View();
        }
    }
}