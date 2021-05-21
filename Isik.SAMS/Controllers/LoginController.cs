using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;

namespace Isik.SAMS.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Insert()
        {
            return View();
        }

        public ActionResult Logout()
        {
            Session.Abandon();
            return View("Index");
        }

        [HttpPost]
        public ActionResult Authorize(SAMS_Users user)
        {
            StudentApprovalManagementEntities db = new StudentApprovalManagementEntities();
            using (db)
            {
                var userDetails = db.SAMS_Users.Where(x => x.Email == user.Email && x.Password == user.Password).FirstOrDefault();
                var isAdmin = db.SAMS_Administrator.Where(x => x.Email == user.Email && x.Password == user.Password).FirstOrDefault();
                if (userDetails == null && isAdmin == null)
                {
                    ViewBag.LoginErrorMessage = "Wrong Email or Password!";
                    return View("Index");
                } else if(isAdmin == null && userDetails != null)
                {
                    Session["UserId"] = userDetails.Id;
                    Session["UserType"] = userDetails.UserType;
                    Session["DepartmentId"] = userDetails.DepartmentId;
                    Session["ProgramId"] = userDetails.ProgramId;
                    Session["PhoneNumber"] = userDetails.PhoneNumber;
                    Session["FirstName"] = userDetails.FirstName;
                    Session["LastName"] = userDetails.LastName;
                    Session["Email"] = userDetails.Email;
                    return RedirectToAction("Index", "Home");
                } else {
                    Session["AdminId"] = isAdmin.Id;
                    Session["FirstName"] = isAdmin.FirstName;
                    Session["LastName"] = isAdmin.LastName;
                    Session["Email"] = isAdmin.Email;
                    return RedirectToAction("Index", "Home");
                }
            }            
        }
    }
}