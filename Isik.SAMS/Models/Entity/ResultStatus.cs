using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Isik.SAMS.Models.Entity
{
    public class ResultStatus
    {
        public bool result { get; set; }
        public string message { get; set; }
        public object objects { get; set; }

        public static ResultStatus operator &(ResultStatus op1, ResultStatus op2)
        {
            if (op1.result == false)
            {

                if (op2.result == false)
                {
                    op1.message += "\n\r" + op2.message;
                }

                return op1;
            }
            else if (op2.result == false)
            {
                return op2;
            }

            int out1Count;
            int out2Count;
            var lastMessage = "";
            if (int.TryParse(op1.message, out out1Count) && int.TryParse(op2.message, out out2Count))
            {
                lastMessage = (out1Count + out2Count).ToString();
            }

            return new ResultStatus { result = true, message = lastMessage };
        }

        public static ResultStatus operator |(ResultStatus op1, ResultStatus op2)
        {
            if (op1.result == true)
                return op1;
            else if (op2.result == true)
                return op2;

            return new ResultStatus { result = false, message = op1.message + "\r\n\r\n" + op2.message };
        }

        public override string ToString()
        {
            if (result)
                return string.Format("Status: {0} - Objects: {1}", result, objects);
            return string.Format("Status: {0} - Message: {1}", result, message);
        }
    }

    public class ResultStatus<T>
    {
        public bool result { get; set; }
        public string message { get; set; }
        public T objects { get; set; }
    }
}