using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Isik.SAMS.Models.Entity;

namespace Isik.SAMS.Classes
{
    public class ResultStatusUI
    {
        public bool Result { get; set; }
        public object Object { get; set; }
        public FeedBack FeedBack { get; set; }

        public ResultStatusUI()
        {

        }

        public ResultStatusUI(ResultStatus resultStatus, string Url = null)
        {
            var feedback = new FeedBack();
            this.Result = resultStatus.result;
            this.Object = resultStatus.objects;
            this.FeedBack = resultStatus.result ?
                feedback.Success((string.IsNullOrEmpty(resultStatus.message) ? "işlem başarıyla gerçekleşti." : resultStatus.message), false, Url) :
                feedback.Warning((string.IsNullOrEmpty(resultStatus.message) ? "İşlem başarısız." : resultStatus.message), false);
        }


    }

    public class FeedBack
    {

        public string action { get; set; }
        public string title { get; set; }
        public string message { get; set; }
        public string status { get; set; }
        public int timeout { get; set; }

        public FeedBack Success(string msg = "", bool sessionCreate = false, string action = null)
        {

            var result = new FeedBack
            {
                action = action ?? String.Empty,
                message = msg,
                title = "İşlem Başarılı",
                status = "success",
                timeout = 2, //  saniye
            };

            if (sessionCreate)
            {
                HttpContext.Current.Session["feedback"] = result;
            }

            return result;
        }

        public FeedBack Error(string logMessage, string msg = "İstek işlenirken sorun oluştu. Lütfen tekrar deneyin.", bool sessionCreate = false)
        {

            Log.Error(logMessage);

            var user = (PageSecurity)HttpContext.Current.Session["userStatus"];
            var userid = user != null && user.user != null ? (Guid?)user.user.id : null;

            var result = new FeedBack
            {
                action = "",
                message = msg,
                title = "Sistem Uyarısı",
                status = "error",
                timeout = 20, //  saniye
            };

            if (sessionCreate)
            {
                HttpContext.Current.Session["feedback"] = result;
            }

            return result;

        }

        public FeedBack NullableMessage(string logMessage, string msg = "Lütfen Başlıkları Eşleştiriniz.", bool sessionCreate = false)
        {

            Log.Error(logMessage);

            var user = (PageSecurity)HttpContext.Current.Session["userStatus"];
            var userid = user != null && user.user != null ? (Guid?)user.user.id : null;

            var result = new FeedBack
            {
                action = "",
                message = msg,
                title = "Sistem Uyarısı",
                status = "info",
                timeout = 20, //  saniye
            };

            if (sessionCreate)
            {
                HttpContext.Current.Session["feedback"] = result;
            }

            return result;

        }


        public FeedBack Warning(string msg = "", bool sessionCreate = false, string action = null)
        {
            var result = new FeedBack
            {
                action = action ?? String.Empty,
                message = msg,
                title = "İşlem Eksik Gerçekleşti",
                status = "warning",
                timeout = 20, //  saniye
            };

            if (sessionCreate)
            {
                HttpContext.Current.Session["feedback"] = result;
            }

            return result;
        }

        public FeedBack Custom(string msg = "", string action = "", string title = "Bilgilendirme", string status = "success", int timeout = 10, bool sessionCreate = false)
        {
            var result = new FeedBack
            {
                action = action,
                message = msg,
                title = title,
                status = status,
                timeout = timeout, //  saniye
            };

            if (sessionCreate)
            {
                HttpContext.Current.Session["feedback"] = result;
            }

            return result;
        }

    }
}