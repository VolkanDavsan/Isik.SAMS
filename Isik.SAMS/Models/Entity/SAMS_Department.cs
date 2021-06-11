//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Isik.SAMS.Models.Entity
{
    using System;
    using System.Collections.Generic;
    
    public partial class SAMS_Department
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public SAMS_Department()
        {
            this.SAMS_StudentApplications = new HashSet<SAMS_StudentApplications>();
            this.SAMS_Users = new HashSet<SAMS_Users>();
        }
    
        public int Id { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedTime { get; set; }
        public Nullable<int> ChangedBy { get; set; }
        public Nullable<System.DateTime> ChangedTime { get; set; }
        public string DepartmentName { get; set; }
        public Nullable<int> ProgramId { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SAMS_StudentApplications> SAMS_StudentApplications { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SAMS_Users> SAMS_Users { get; set; }
        public virtual SAMS_Program SAMS_Program { get; set; }
    }
}
