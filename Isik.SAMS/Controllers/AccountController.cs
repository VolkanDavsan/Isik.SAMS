using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Isik.SAMS.Models.Entity;

namespace Isik.SAMS.Controllers
{
    public class AccountController : Controller
    {
        // GET: Account
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
            var model = db.SAMS_Users.ToList();
            ViewBag.Message = TempData["message"] == null ? null : setMessage(TempData["message"].ToString());
            return View(model);
        }
        [HttpGet]
        public ActionResult Insert()
        {
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            Dictionary<int, string> dicUserTypes = new Dictionary<int, string>();
            List<SAMS_UserType> userTypeList = db.SAMS_UserType.ToList<SAMS_UserType>();
            foreach (SAMS_UserType a in userTypeList)
            {
                dicUserTypes.Add(a.Id, a.UserTypeName);
            }
            ViewBag.UserTypes = dicUserTypes;
            return View();
        }
        [HttpPost]
        public ActionResult Insert(SAMS_Users s1)
        {
            s1.CreatedBy = 1; // adminId when the session created
            s1.CreatedTime = DateTime.Now;
            db.SAMS_Users.Add(s1);
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
            var user = db.SAMS_Users.Find(id);
            if (user != null)
            {
                db.SAMS_Users.Remove(user);
                db.SaveChanges();
                result = true;
            }
            return Json(result, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public ActionResult Update(int Id)
        {
            var program = db.SAMS_Users.Find(Id);
            ViewBag.Departments = new SelectList(db.SAMS_Department.ToList(), "Id", "DepartmentName");
            ViewBag.Programs = new SelectList(db.SAMS_Program.ToList(), "Id", "ProgramName");
            foreach (SelectListItem a in ViewBag.Departments)
            {
                if (Convert.ToInt32(a.Value) == program.DepartmentId)
                {
                    a.Selected = true;
                }
            }

            if (program.UserType != 2)
            {
                foreach (SelectListItem a in ViewBag.Programs)
                {
                    if (Convert.ToInt32(a.Value) == program.ProgramId)
                    {
                        a.Selected = true;
                    }
                }
            }
            return View(program);
        }

        [HttpPost]
        public ActionResult Update(SAMS_Users p1)
        {
            var user = db.SAMS_Users.Find(p1.Id);
            user.FirstName = p1.FirstName;
            user.LastName = p1.LastName;
            user.UserType = p1.UserType;
            user.Email = p1.Email;
            db.SaveChanges();
            TempData["Message"] = "3";
            return RedirectToAction("Index");
        }
    }

}