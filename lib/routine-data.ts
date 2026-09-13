import { DayRoutine } from "./routine-types";

export * from "./routine-types";

export const DEFAULT_ROUTINE_DATA: DayRoutine[] = [
  {
    day: "Sunday",
    dateFormatted: "13 September 2026",
    sections: [
      {
        sectionId: "6A", className: "Class 6", sectionName: "A", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "RTM", room: "201" },
          { subject: "Ban", teacherCode: "CM", room: "201" },
          { subject: "Eng 1", teacherCode: "IHT", room: "201" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Sci", teacherCode: "SRY", room: "201" },
          { subject: "Math", teacherCode: "AA", room: "201" },
          null
        ]
      },
      {
        sectionId: "6B", className: "Class 6", sectionName: "B", isActive: true,
        periods: [
          { subject: "Arts", teacherCode: "IJT", room: "202" },
          { subject: "Math", teacherCode: "TIM", room: "202" },
          { subject: "BGS", teacherCode: "LB", room: "202" },
          { subject: "Eng 1", teacherCode: "ASM", room: "202" },
          { subject: "Sci", teacherCode: "UFC", room: "202" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          null
        ]
      },
      {
        sectionId: "6C", className: "Class 6", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "KI", room: "203" },
          { subject: "BGS", teacherCode: "SA", room: "203" },
          { subject: "Sci", teacherCode: "UFC", room: "203" },
          { subject: "Lan_L", teacherCode: "ARH", room: "Lang Lab" },
          { subject: "Ban", teacherCode: "CM", room: "203" },
          { subject: "Math", teacherCode: "ZUR", room: "203" },
          null
        ]
      },
      {
        sectionId: "7A", className: "Class 7", sectionName: "A", isActive: true,
        periods: [
          { subject: "Rst", teacherCode: "AB", room: "204" },
          { subject: "BGS", teacherCode: "LB", room: "204" },
          { subject: "Sci", teacherCode: "ZC", room: "204" },
          { subject: "Math", teacherCode: "TIM", room: "204" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Agri/H.Sci", teacherCode: "SRY/UFC", room: "204" },
          null
        ]
      },
      {
        sectionId: "7B", className: "Class 7", sectionName: "B", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "MAM", room: "205" },
          { subject: "Math", teacherCode: "NR", room: "205" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Ban", teacherCode: "DR", room: "205" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "205" },
          { subject: "Math", teacherCode: "TIM", room: "205" },
          null
        ]
      },
      {
        sectionId: "7C", className: "Class 7", sectionName: "C", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "DR", room: "206" },
          { subject: "BGS", teacherCode: "MU", room: "206" },
          { subject: "Eng 2", teacherCode: "ASM", room: "206" },
          { subject: "Sci", teacherCode: "ZC", room: "206" },
          { subject: "Math", teacherCode: "ZUR", room: "206" },
          { subject: "Rst", teacherCode: "AB", room: "206" },
          null
        ]
      },
      {
        sectionId: "8A", className: "Class 8", sectionName: "A", isActive: true, statusReason: "Math Exam",
        periods: [
          { subject: "Math Exam", teacherCode: "RMMH", isExam: true },
          { subject: "Rev. class", teacherCode: "KI" },
          { subject: "Eng 1 Exam", teacherCode: "AAB", isExam: true },
          { subject: "Math", teacherCode: "SZK", room: "301" },
          { subject: "Ban 1", teacherCode: "MN", room: "301" },
          { subject: "Sci", teacherCode: "ZC", room: "301" },
          { subject: "Eng 1", teacherCode: "SM", room: "301" }
        ]
      },
      {
        sectionId: "8B", className: "Class 8", sectionName: "B", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "TIM", room: "302" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "302" },
          { subject: "Ban", teacherCode: "DR", room: "302" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Ban", teacherCode: "MHM", room: "302" },
          { subject: "Eng 1", teacherCode: "KI", room: "302" },
          null
        ]
      },
      {
        sectionId: "8C", className: "Class 8", sectionName: "C", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "CM", room: "303" },
          { subject: "Ban", teacherCode: "MHM", room: "303" },
          { subject: "Eng 2", teacherCode: "MAM", room: "303" },
          { subject: "P.Ed", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Math", teacherCode: "TIM", room: "303" },
          { subject: "Sci", teacherCode: "FAJ", room: "303" },
          null
        ]
      },
      {
        sectionId: "9A", className: "Class 9", sectionName: "A", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "AA", room: "304" },
          { subject: "Chem", teacherCode: "GCS", room: "304" },
          { subject: "BGS", teacherCode: "TAM", room: "304" },
          { subject: "Bio", teacherCode: "FAJ", room: "304" },
          { subject: "Phy", teacherCode: "ZI", room: "304" },
          { subject: "Eng 2", teacherCode: "RHR", room: "304" },
          { subject: "Eng 1", teacherCode: "MAM", room: "304" }
        ]
      },
      {
        sectionId: "9B", className: "Class 9", sectionName: "B", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "ZUR", room: "305" },
          { subject: "Ban", teacherCode: "MN", room: "305" },
          { subject: "Phy", teacherCode: "TU", room: "305" },
          { subject: "H.Math", teacherCode: "NR", room: "305" },
          { subject: "Math", teacherCode: "AA", room: "305" },
          { subject: "H.Math", teacherCode: "LYM", room: "305" },
          { subject: "Chem", teacherCode: "ZC", room: "305" }
        ]
      },
      {
        sectionId: "9C", className: "Class 9", sectionName: "C", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MS", room: "306" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Phy", teacherCode: "NC", room: "306" },
          { subject: "Eng 1", teacherCode: "KI", room: "306" },
          { subject: "Math", teacherCode: "SZK", room: "306" },
          { subject: "Bio", teacherCode: "MSF", room: "306" },
          { subject: "Eng 2", teacherCode: "ASM", room: "306" }
        ]
      },
      {
        sectionId: "9Bstd", className: "Class 9", sectionName: "Bstd", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "MNI", room: "307" },
          { subject: "Bang", teacherCode: "MS", room: "307" },
          { subject: "Eng 2", teacherCode: "RTM", room: "307" },
          { subject: "Acc", teacherCode: "MHN", room: "307" },
          { subject: "FBI", teacherCode: "TAH", room: "307" },
          { subject: "Eng 1", teacherCode: "ASM", room: "307" },
          { subject: "B En.", teacherCode: "MHK", room: "307" }
        ]
      },
      {
        sectionId: "10A", className: "Class 10", sectionName: "A", isActive: true,
        periods: [
          { subject: "Bio-P", teacherCode: "MSF", room: "Bio Lab" },
          { subject: "Phy-Prac", teacherCode: "ZI", room: "Phy Lab" },
          { subject: "Math", teacherCode: "AA", room: "401" },
          { subject: "H.Math", teacherCode: "LYM", room: "401" },
          { subject: "Eng 2", teacherCode: "SM", room: "401" },
          { subject: "Ban", teacherCode: "MHM", room: "401" },
          { subject: "Eng 1", teacherCode: "IHT", room: "401" }
        ]
      },
      {
        sectionId: "10B", className: "Class 10", sectionName: "B", isActive: true,
        periods: [
          { subject: "Bio", teacherCode: "FAJ", room: "402" },
          { subject: "Eng 2", teacherCode: "SM", room: "402" },
          { subject: "Ban", teacherCode: "MHM", room: "402" },
          { subject: "Math", teacherCode: "ZUR", room: "402" },
          { subject: "BGS", teacherCode: "TAM", room: "402" },
          { subject: "Ban", teacherCode: "MS", room: "402" },
          { subject: "Math", teacherCode: "LYM", room: "402" }
        ]
      },
      {
        sectionId: "10C", className: "Class 10", sectionName: "C", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Ban", teacherCode: "MSA", room: "403" },
          { subject: "Eng 2", teacherCode: "MAM", room: "403" },
          { subject: "Eng 1", teacherCode: "IHT", room: "403" },
          { subject: "Chem", teacherCode: "MZI", room: "403" },
          { subject: "Physics", teacherCode: "NC", room: "403" }
        ]
      },
      {
        sectionId: "10BST", className: "Class 10", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "IHT", room: "404" },
          { subject: "Acc", teacherCode: "MHN", room: "404" },
          { subject: "Ban", teacherCode: "MN", room: "404" },
          { subject: "Agri/H.Sci", teacherCode: "SA/UFC", room: "404" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Eng 1", teacherCode: "RTM", room: "404" },
          { subject: "Math", teacherCode: "NR", room: "404" }
        ]
      },
      {
        sectionId: "11A", className: "Class 11", sectionName: "A", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MHA", room: "501" },
          { subject: "H.Math", teacherCode: "MNI", room: "501" },
          { subject: "Physics", teacherCode: "ZI", room: "501" },
          { subject: "Eng", teacherCode: "SM", room: "501" },
          { subject: "Ban", teacherCode: "MSA", room: "501" },
          { subject: "Chemistry", teacherCode: "GCS", room: "501" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" }
        ]
      },
      {
        sectionId: "11B", className: "Class 11", sectionName: "B", isActive: true,
        periods: [
          { subject: "Chemistry", teacherCode: "ZC", room: "502" },
          { subject: "Ban", teacherCode: "MSA", room: "502" },
          { subject: "Chemistry", teacherCode: "MZI", room: "502" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Eng", teacherCode: "MAM", room: "502" },
          { subject: "Physics", teacherCode: "TU", room: "502" },
          { subject: "Bang", teacherCode: "CM", room: "502" }
        ]
      },
      {
        sectionId: "11C", className: "Class 11", sectionName: "C", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Biology", teacherCode: "MSF", room: "503" },
          { subject: "Ban", teacherCode: "MHA", room: "503" },
          { subject: "Eng", teacherCode: "IHT", room: "503" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Physics", teacherCode: "ZI", room: "503" },
          { subject: "Biology", teacherCode: "SJ", room: "503" }
        ]
      },
      {
        sectionId: "11BST", className: "Class 11", sectionName: "BST", isActive: true,
        periods: [
          { subject: "FBI", teacherCode: "TAH", room: "504" },
          { subject: "BOM", teacherCode: "MHK", room: "504" },
          { subject: "FBI", teacherCode: "TAH", room: "504" },
          { subject: "Eng", teacherCode: "RHR", room: "504" },
          { subject: "Eng", teacherCode: "RTM", room: "504" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Accounting", teacherCode: "MHN", room: "504" }
        ]
      },
      {
        sectionId: "12A", className: "Class 12", sectionName: "A", isActive: true,
        periods: [
          { subject: "Chem", teacherCode: "GCS", room: "601" },
          { subject: "Bio-Prac/Stat/Drw", teacherCode: "FAJ/YK/AAN", isPractical: true },
          { subject: "Bio-Prac/Stat/Drw", teacherCode: "SJ/YK/AAN", isPractical: true },
          { subject: "H.Math", teacherCode: "AA", room: "601" },
          { subject: "Chem", teacherCode: "MZI", room: "601" },
          { subject: "Physics", teacherCode: "NC", room: "601" },
          { subject: "Chem", teacherCode: "MRN", room: "601" }
        ]
      },
      {
        sectionId: "12B", className: "Class 12", sectionName: "B", isActive: true,
        periods: [
          { subject: "Phy", teacherCode: "NC", room: "602" },
          { subject: "Stat-Prac/Drw", teacherCode: "YK/AAN", isPractical: true },
          { subject: "Stat-Prac/Drw", teacherCode: "YK/AAN", isPractical: true },
          { subject: "Chemistry", teacherCode: "MZI", room: "602" },
          { subject: "H.Math", teacherCode: "NR", room: "602" },
          { subject: "Chemistry", teacherCode: "MRN", room: "602" },
          { subject: "Phy", teacherCode: "TU", room: "602" }
        ]
      },
      {
        sectionId: "12C", className: "Class 12", sectionName: "C", isActive: true,
        periods: [
          { subject: "Chem", teacherCode: "MRN", room: "603" },
          { subject: "H.Math", teacherCode: "SZK", room: "603" },
          { subject: "H.Math", teacherCode: "ZUR", room: "603" },
          { subject: "Physics", teacherCode: "TU", room: "603" },
          { subject: "H.Math", teacherCode: "MNI", room: "603" },
          { subject: "Ban", teacherCode: "MSA", room: "603" },
          { subject: "Chem", teacherCode: "GCS", room: "603" }
        ]
      },
      {
        sectionId: "12BST", className: "Class 12", sectionName: "BST", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Stat-Prac/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "Stat-Prac/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "BOM", teacherCode: "MHK", room: "604" },
          { subject: "BOM", teacherCode: "MHK", room: "604" },
          { subject: "FBI", teacherCode: "TAH", room: "604" },
          { subject: "Eng", teacherCode: "RHR", room: "604" }
        ]
      }
    ]
  },
  {
    day: "Monday",
    dateFormatted: "14 September 2026",
    sections: [
      {
        sectionId: "6A", className: "Class 6", sectionName: "A", isActive: true,
        periods: [
          { subject: "Sci", teacherCode: "UFC", room: "201" },
          { subject: "Eng 1", teacherCode: "IHT", room: "201" },
          { subject: "BGS", teacherCode: "TAM", room: "201" },
          { subject: "Rst", teacherCode: "RMMH", room: "201" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Ban", teacherCode: "DR", room: "201" },
          null
        ]
      },
      {
        sectionId: "6B", className: "Class 6", sectionName: "B", isActive: true,
        periods: [
          { subject: "BGS", teacherCode: "TAM", room: "202" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "202" },
          { subject: "Ban", teacherCode: "DR", room: "202" },
          { subject: "BGS", teacherCode: "SA", room: "202" },
          { subject: "Eng 1", teacherCode: "ASM", room: "202" },
          { subject: "Sci", teacherCode: "SRY", room: "202" },
          null
        ]
      },
      {
        sectionId: "6C", className: "Class 6", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "ASM", room: "203" },
          { subject: "Ban", teacherCode: "CM", room: "203" },
          { subject: "Eng 2", teacherCode: "KI", room: "203" },
          { subject: "Rst", teacherCode: "AAB", room: "203" },
          { subject: "Sci", teacherCode: "SRY", room: "203" },
          { subject: "Sci", teacherCode: "UFC", room: "203" },
          null
        ]
      },
      {
        sectionId: "7A", className: "Class 7", sectionName: "A", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "KI", room: "204" },
          { subject: "Math", teacherCode: "TIM", room: "204" },
          { subject: "Ban", teacherCode: "MHM", room: "204" },
          { subject: "Sci", teacherCode: "UFC", room: "204" },
          { subject: "R.St", teacherCode: "AB", room: "204" },
          { subject: "BGS", teacherCode: "SA", room: "204" },
          null
        ]
      },
      {
        sectionId: "7B", className: "Class 7", sectionName: "B", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "DR", room: "205" },
          { subject: "Agri/H.Sc", teacherCode: "SRY/UFC", room: "205" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "205" },
          { subject: "Math", teacherCode: "TIM", room: "205" },
          { subject: "Eng 2", teacherCode: "RTM", room: "205" },
          { subject: "BGS", teacherCode: "LB", room: "205" },
          null
        ]
      },
      {
        sectionId: "7C", className: "Class 7", sectionName: "C", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "CM", room: "206" },
          { subject: "Library", teacherCode: "AAM", room: "Library" },
          { subject: "Eng 1", teacherCode: "IHT", room: "206" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Rst", teacherCode: "AAB", room: "206" },
          { subject: "Sci", teacherCode: "FAJ", room: "206" },
          null
        ]
      },
      {
        sectionId: "8A", className: "Class 8", sectionName: "A", isActive: true, statusReason: "Exam Day",
        periods: [
          { subject: "Sci Exam", teacherCode: "MZI", isExam: true },
          { subject: "Rev.", teacherCode: "MN" },
          { subject: "BGS Exam", teacherCode: "SA", isExam: true },
          { subject: "Ban 2", teacherCode: "MSA", room: "301" },
          { subject: "Math", teacherCode: "SZK", room: "301" },
          { subject: "Eng 2", teacherCode: "MAM", room: "301" },
          { subject: "Sci", teacherCode: "SJ", room: "301" }
        ]
      },
      {
        sectionId: "8B", className: "Class 8", sectionName: "B", isActive: true,
        periods: [
          { subject: "BGS", teacherCode: "MU", room: "302" },
          { subject: "Sci", teacherCode: "MSF", room: "302" },
          { subject: "Library", teacherCode: "AAM", room: "Library" },
          { subject: "Math", teacherCode: "LYM", room: "302" },
          { subject: "Ban", teacherCode: "CM", room: "302" },
          { subject: "Math", teacherCode: "TIM", room: "302" },
          null
        ]
      },
      {
        sectionId: "8C", className: "Class 8", sectionName: "C", isActive: true,
        periods: [
          { subject: "R.St", teacherCode: "AAB", room: "303" },
          { subject: "Math", teacherCode: "AA", room: "303" },
          { subject: "Ban", teacherCode: "MN", room: "303" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Rst", teacherCode: "RMMH", room: "303" },
          { subject: "Math", teacherCode: "ZUR", room: "303" },
          null
        ]
      },
      {
        sectionId: "9A", className: "Class 9", sectionName: "A", isActive: true,
        periods: [
          { subject: "H.Math", teacherCode: "MNI", room: "304" },
          { subject: "Ban", teacherCode: "MHM", room: "304" },
          { subject: "Physics", teacherCode: "TU", room: "304" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Math", teacherCode: "AA", room: "304" },
          { subject: "Bio", teacherCode: "MSF", room: "304" },
          { subject: "Math", teacherCode: "NR", room: "304" }
        ]
      },
      {
        sectionId: "9B", className: "Class 9", sectionName: "B", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MS", room: "305" },
          { subject: "Math", teacherCode: "ZUR", room: "305" },
          { subject: "Eng 2", teacherCode: "MAM", room: "305" },
          { subject: "BGS", teacherCode: "LB", room: "305" },
          { subject: "Chemistry", teacherCode: "MZI", room: "305" },
          { subject: "H.M", teacherCode: "LYM", room: "305" },
          { subject: "Eng 1", teacherCode: "KI", room: "305" }
        ]
      },
      {
        sectionId: "9C", className: "Class 9", sectionName: "C", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "LYM", room: "306" },
          { subject: "Math", teacherCode: "SZK", room: "306" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Chem", teacherCode: "GCS", room: "306" },
          { subject: "H.Math", teacherCode: "ZUR", room: "306" },
          { subject: "BGS", teacherCode: "TAM", room: "306" },
          { subject: "Ban", teacherCode: "CM", room: "306" }
        ]
      },
      {
        sectionId: "9Bstd", className: "Class 9", sectionName: "Bstd", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "FBI", teacherCode: "TAH", room: "307" },
          { subject: "Eng 1", teacherCode: "ASM", room: "307" },
          { subject: "Math", teacherCode: "MNI", room: "307" },
          { subject: "G. Sci", teacherCode: "NC", room: "307" },
          { subject: "B En.", teacherCode: "MHK", room: "307" },
          { subject: "Acc", teacherCode: "MHN", room: "307" }
        ]
      },
      {
        sectionId: "10A", className: "Class 10", sectionName: "A", isActive: true,
        periods: [
          { subject: "BGS", teacherCode: "LB", room: "401" },
          { subject: "Ban", teacherCode: "MHA", room: "401" },
          { subject: "Chem", teacherCode: "GCS", room: "401" },
          { subject: "Ban", teacherCode: "CM", room: "401" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Eng 2", teacherCode: "SM", room: "401" },
          { subject: "Chem", teacherCode: "MRN", room: "401" }
        ]
      },
      {
        sectionId: "10B", className: "Class 10", sectionName: "B", isActive: true,
        periods: [
          { subject: "Physics", teacherCode: "NC", room: "402" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Eng 2", teacherCode: "SM", room: "402" },
          { subject: "Math", teacherCode: "NR", room: "402" },
          { subject: "Eng 1", teacherCode: "IHT", room: "402" },
          { subject: "H.Math", teacherCode: "SZK", room: "402" },
          { subject: "Ban", teacherCode: "MHM", room: "402" }
        ]
      },
      {
        sectionId: "10C", className: "Class 10", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "RHR", room: "403" },
          { subject: "BGS", teacherCode: "MU", room: "403" },
          { subject: "Phy", teacherCode: "ZI", room: "403" },
          { subject: "H.Math", teacherCode: "AA", room: "403" },
          { subject: "Math", teacherCode: "LYM", room: "403" },
          { subject: "Ban", teacherCode: "MSA", room: "403" },
          { subject: "Eng 2", teacherCode: "MAM", room: "403" }
        ]
      },
      {
        sectionId: "10BST", className: "Class 10", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "NR", room: "404" },
          { subject: "Acc", teacherCode: "MHN", room: "404" },
          { subject: "B En.", teacherCode: "MHK", room: "404" },
          { subject: "Science", teacherCode: "SJ", room: "404" },
          { subject: "Ban", teacherCode: "MSA", room: "404" },
          { subject: "FBI", teacherCode: "TAH", room: "404" },
          { subject: "Eng 2", teacherCode: "ASM", room: "404" }
        ]
      },
      {
        sectionId: "11A", className: "Class 11", sectionName: "A", isActive: true,
        periods: [
          { subject: "H.Math", teacherCode: "AA", room: "501" },
          { subject: "Eng", teacherCode: "SM", room: "501" },
          { subject: "H.Math", teacherCode: "MNI", room: "501" },
          { subject: "Bio/Stat/Drw", teacherCode: "FAJ/YK/AAN", isPractical: true },
          { subject: "Physics", teacherCode: "ZI", room: "501" },
          { subject: "ENG", teacherCode: "RTM", room: "501" },
          { subject: "Bio/Stat/Drw", teacherCode: "MSF/YK/AAN", isPractical: true }
        ]
      },
      {
        sectionId: "11B", className: "Class 11", sectionName: "B", isActive: true,
        periods: [
          { subject: "Physics", teacherCode: "TU", room: "502" },
          { subject: "Eng", teacherCode: "RHR", room: "502" },
          { subject: "H.Math", teacherCode: "NR", room: "502" },
          { subject: "Stat/Drw", teacherCode: "YK/AAN", isPractical: true },
          { subject: "Ban", teacherCode: "MN", room: "502" },
          { subject: "Physics", teacherCode: "NC", room: "502" },
          { subject: "Stat/Drw", teacherCode: "YK/AAN", isPractical: true }
        ]
      },
      {
        sectionId: "11C", className: "Class 11", sectionName: "C", isActive: true,
        periods: [
          { subject: "Phy", teacherCode: "ZI", room: "503" },
          { subject: "Ban", teacherCode: "MSA", room: "503" },
          { subject: "H.M", teacherCode: "SZK", room: "503" },
          { subject: "HM", teacherCode: "ZUR", room: "503" },
          { subject: "Chem", teacherCode: "MRN", room: "503" },
          { subject: "Eng", teacherCode: "RHR", room: "503" },
          { subject: "BIO", teacherCode: "FAJ", room: "503" }
        ]
      },
      {
        sectionId: "11BST", className: "Class 11", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MSA", room: "504" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Accounting", teacherCode: "MHN", room: "504" },
          { subject: "Stat/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "BOM", teacherCode: "MHK", room: "504" },
          { subject: "Ban", teacherCode: "MHM", room: "504" },
          { subject: "Stat/Agri", teacherCode: "YK/SA", isPractical: true }
        ]
      },
      {
        sectionId: "12A", className: "Class 12", sectionName: "A", isActive: true,
        periods: [
          { subject: "Biol/Stat/Drw", teacherCode: "SJ/YK/AAN", isPractical: true },
          { subject: "H.Math", teacherCode: "LYM", room: "601" },
          { subject: "Chemistry", teacherCode: "MRN", room: "601" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Eng", teacherCode: "SM", room: "601" },
          { subject: "H.Math", teacherCode: "MNI", room: "601" },
          { subject: "Ban", teacherCode: "MHA", room: "601" }
        ]
      },
      {
        sectionId: "12B", className: "Class 12", sectionName: "B", isActive: true,
        periods: [
          { subject: "Stat/E&D", teacherCode: "YK/AAN", isPractical: true },
          { subject: "Physics-Prac", teacherCode: "NC", isPractical: true },
          { subject: "Physics-Prac", teacherCode: "NC", isPractical: true },
          { subject: "Chem", teacherCode: "ZC", room: "602" },
          { subject: "Bang", teacherCode: "MHA", room: "602" },
          { subject: "Physics", teacherCode: "TU", room: "602" },
          { subject: "H.Math", teacherCode: "AA", room: "602" }
        ]
      },
      {
        sectionId: "12C", className: "Class 12", sectionName: "C", isActive: true,
        periods: [
          { subject: "H.M", teacherCode: "ZUR", room: "603" },
          { subject: "Chem-Prac", teacherCode: "ZC", isPractical: true },
          { subject: "Chem-Prac", teacherCode: "ZC", isPractical: true },
          { subject: "Phy", teacherCode: "TU", room: "603" },
          { subject: "Bio", teacherCode: "SJ", room: "603" },
          { subject: "Physics", teacherCode: "ZI", room: "603" },
          { subject: "Chem", teacherCode: "GCS", room: "603" }
        ]
      },
      {
        sectionId: "12BST", className: "Class 12", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Stat/Agri", teacherCode: "YK/SA", isPractical: true },
          { subject: "Eng", teacherCode: "MAM", room: "604" },
          { subject: "FBI", teacherCode: "TAH", room: "604" },
          { subject: "BOM", teacherCode: "MHK", room: "604" },
          { subject: "Accounting", teacherCode: "MHN", room: "604" },
          { subject: "Ban", teacherCode: "MS", room: "604" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" }
        ]
      }
    ]
  },
  {
    day: "Tuesday",
    dateFormatted: "15 September 2026",
    sections: [
      {
        sectionId: "6A", className: "Class 6", sectionName: "A", isActive: true,
        periods: [
          { subject: "Sci", teacherCode: "UFC", room: "201" },
          { subject: "Lan_L", teacherCode: "ARH", room: "Lang Lab" },
          { subject: "Ban", teacherCode: "DR", room: "201" },
          { subject: "BGS", teacherCode: "LB", room: "201" },
          { subject: "Rst", teacherCode: "AB", room: "201" },
          { subject: "Math", teacherCode: "TIM", room: "201" },
          null
        ]
      },
      {
        sectionId: "6B", className: "Class 6", sectionName: "B", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "DR", room: "202" },
          { subject: "Eng 2", teacherCode: "KI", room: "202" },
          { subject: "Sci", teacherCode: "UFC", room: "202" },
          { subject: "Sci", teacherCode: "SRY", room: "202" },
          { subject: "Bang", teacherCode: "CM", room: "202" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "202" },
          null
        ]
      },
      {
        sectionId: "6C", className: "Class 6", sectionName: "C", isActive: true,
        periods: [
          { subject: "Rst", teacherCode: "AB", room: "203" },
          { subject: "Math", teacherCode: "ZUR", room: "203" },
          { subject: "Eng 1", teacherCode: "ASM", room: "203" },
          { subject: "Maths", teacherCode: "AAN", room: "203" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Ban", teacherCode: "DR", room: "203" },
          null
        ]
      },
      {
        sectionId: "7A", className: "Class 7", sectionName: "A", isActive: true,
        periods: [
          { subject: "BGS", teacherCode: "SA", room: "204" },
          { subject: "Lib", teacherCode: "AAM", room: "Library" },
          { subject: "Eng 1", teacherCode: "KI", room: "204" },
          { subject: "Ban", teacherCode: "DR", room: "204" },
          { subject: "Math", teacherCode: "TIM", room: "204" },
          { subject: "Ban", teacherCode: "MHM", room: "204" },
          null
        ]
      },
      {
        sectionId: "7B", className: "Class 7", sectionName: "B", isActive: true,
        periods: [
          { subject: "Rst", teacherCode: "RMMH/DRD", room: "205" },
          { subject: "BGS", teacherCode: "SA", room: "205" },
          { subject: "Math", teacherCode: "TIM", room: "205" },
          { subject: "BGS", teacherCode: "TAM", room: "205" },
          { subject: "Ban", teacherCode: "DR(B)", room: "205" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          null
        ]
      },
      {
        sectionId: "7C", className: "Class 7", sectionName: "C", isActive: true,
        periods: [
          { subject: "Sci", teacherCode: "ZC", room: "206" },
          { subject: "Math", teacherCode: "TIM", room: "206" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Math", teacherCode: "ZUR", room: "206" },
          { subject: "Ban", teacherCode: "MHM", room: "206" },
          { subject: "Eng 1", teacherCode: "RTM", room: "206" },
          null
        ]
      },
      {
        sectionId: "8A", className: "Class 8", sectionName: "A", isActive: true, statusReason: "Exam Day",
        periods: [
          { subject: "Math Exam", teacherCode: "AAB", isExam: true },
          { subject: "Rev.", teacherCode: "ASM" },
          { subject: "Ban 1 Exam", teacherCode: "CM", isExam: true },
          { subject: "Eng 1", teacherCode: "MAM", room: "301" },
          { subject: "Math", teacherCode: "NR", room: "301" },
          { subject: "Bang 1", teacherCode: "MSA", room: "301" },
          { subject: "BGS", teacherCode: "MU", room: "301" }
        ]
      },
      {
        sectionId: "8B", className: "Class 8", sectionName: "B", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "RTM", room: "302" },
          { subject: "BGS", teacherCode: "TAM", room: "302" },
          { subject: "Phy. Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Sci", teacherCode: "FAJ", room: "302" },
          { subject: "Eng 2", teacherCode: "IHT", room: "302" },
          { subject: "Rst", teacherCode: "AAB/DRD", room: "302" },
          null
        ]
      },
      {
        sectionId: "8C", className: "Class 8", sectionName: "C", isActive: true,
        periods: [
          { subject: "BGS", teacherCode: "LB", room: "303" },
          { subject: "BGS", teacherCode: "MU", room: "303" },
          { subject: "Lib", teacherCode: "AAM", room: "Library" },
          { subject: "Rst", teacherCode: "RMMH", room: "303" },
          { subject: "Eng 1", teacherCode: "RTM", room: "303" },
          { subject: "Ban", teacherCode: "CM", room: "303" },
          null
        ]
      },
      {
        sectionId: "9A", className: "Class 9", sectionName: "A", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "NR", room: "304" },
          { subject: "Che", teacherCode: "MRN", room: "304" },
          { subject: "Eng 1", teacherCode: "MAM", room: "304" },
          { subject: "Physics", teacherCode: "ZI", room: "304" },
          { subject: "Eng 2", teacherCode: "RHR", room: "304" },
          { subject: "Ban", teacherCode: "MHA", room: "304" },
          { subject: "BGS", teacherCode: "TAM", room: "304" }
        ]
      },
      {
        sectionId: "9B", className: "Class 9", sectionName: "B", isActive: true,
        periods: [
          { subject: "Eng", teacherCode: "MAM", room: "305" },
          { subject: "Rst", teacherCode: "RMMH/DRD", room: "305" },
          { subject: "Chem", teacherCode: "MZI", room: "305" },
          { subject: "Physics", teacherCode: "TU", room: "305" },
          { subject: "Ban", teacherCode: "MHA", room: "305" },
          { subject: "Biology", teacherCode: "MSF", room: "305" },
          { subject: "Eng 1", teacherCode: "KI", room: "305" }
        ]
      },
      {
        sectionId: "9C", className: "Class 9", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "RHR", room: "306" },
          { subject: "Ban", teacherCode: "CM", room: "306" },
          { subject: "H.Math", teacherCode: "AA", room: "306" },
          { subject: "Phys", teacherCode: "NC", room: "306" },
          { subject: "Eng 2", teacherCode: "ASM", room: "306" },
          { subject: "Che", teacherCode: "MZI", room: "306" },
          { subject: "Bio", teacherCode: "FAJ", room: "306" }
        ]
      },
      {
        sectionId: "9Bstd", className: "Class 9", sectionName: "Bstd", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "LYM", room: "307" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "307" },
          { subject: "FBI", teacherCode: "TAH", room: "307" },
          { subject: "Ban", teacherCode: "MSA", room: "307" },
          { subject: "Agri/H.Sci", teacherCode: "SA/UFC", room: "307" },
          { subject: "Math", teacherCode: "YK", room: "307" },
          { subject: "Sci", teacherCode: "ZC", room: "307" }
        ]
      },
      {
        sectionId: "10A", className: "Class 10", sectionName: "A", isActive: true,
        periods: [
          { subject: "Phy", teacherCode: "ZI", room: "401" },
          { subject: "H.M", teacherCode: "MNI", room: "401" },
          { subject: "Eng 1", teacherCode: "IHT", room: "401" },
          { subject: "Ban", teacherCode: "MHM", room: "401" },
          { subject: "Math", teacherCode: "SZK", room: "401" },
          { subject: "BGS", teacherCode: "MU", room: "401" },
          { subject: "Biology", teacherCode: "SJ", room: "401" }
        ]
      },
      {
        sectionId: "10B", className: "Class 10", sectionName: "B", isActive: true,
        periods: [
          { subject: "H.M", teacherCode: "SZK", room: "402" },
          { subject: "Rst", teacherCode: "AAB", room: "402" },
          { subject: "Bio", teacherCode: "MSF", room: "402" },
          { subject: "Che", teacherCode: "MZI", room: "402" },
          { subject: "Ban", teacherCode: "MS", room: "402" },
          { subject: "Eng 1", teacherCode: "KI", room: "402" },
          { subject: "G.M", teacherCode: "NR", room: "402" }
        ]
      },
      {
        sectionId: "10C", className: "Class 10", sectionName: "C", isActive: true,
        periods: [
          { subject: "Chem-Prac", teacherCode: "MZI", isPractical: true },
          { subject: "Math", teacherCode: "LYM", room: "403" },
          { subject: "Phy-Prac", teacherCode: "NC", isPractical: true },
          { subject: "BGS", teacherCode: "MU", room: "403" },
          { subject: "Rst", teacherCode: "AAB/DRD", room: "403" },
          { subject: "Ban", teacherCode: "MS", room: "403" },
          { subject: "H.Math", teacherCode: "AA", room: "403" }
        ]
      },
      {
        sectionId: "10BST", className: "Class 10", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MSA", room: "404" },
          { subject: "B En.", teacherCode: "MHK", room: "404" },
          { subject: "Eng 1", teacherCode: "RTM", room: "404" },
          { subject: "FBI", teacherCode: "TAH", room: "404" },
          { subject: "Rst", teacherCode: "RMMH/DRD", room: "404" },
          { subject: "Agri/H.Sci", teacherCode: "SA/UFC", room: "404" },
          { subject: "Math", teacherCode: "ZUR", room: "404" }
        ]
      },
      {
        sectionId: "11A", className: "Class 11", sectionName: "A", isActive: true,
        periods: [
          { subject: "Bio/Stat/Drw", teacherCode: "FAJ/YK/AAN", isPractical: true },
          { subject: "H.Math", teacherCode: "AA", room: "501" },
          { subject: "Eng", teacherCode: "SM", room: "501" },
          { subject: "Ban", teacherCode: "MS", room: "501" },
          { subject: "Ban", teacherCode: "MN", room: "501" },
          { subject: "Chemistry", teacherCode: "MRN", room: "501" },
          { subject: "H.Math", teacherCode: "LYM", room: "501" }
        ]
      },
      {
        sectionId: "11B", className: "Class 11", sectionName: "B", isActive: true,
        periods: [
          { subject: "Stat/Drw", teacherCode: "YK/AAN", isPractical: true },
          { subject: "Chem", teacherCode: "GCS", room: "502" },
          { subject: "Eng", teacherCode: "RHR", room: "502" },
          { subject: "Ban", teacherCode: "MHA", room: "502" },
          { subject: "Physics", teacherCode: "NC", room: "502" },
          { subject: "Eng", teacherCode: "MAM", room: "502" },
          { subject: "Ban", teacherCode: "MN", room: "502" }
        ]
      },
      {
        sectionId: "11C", className: "Class 11", sectionName: "C", isActive: true,
        periods: [
          { subject: "H.M", teacherCode: "MNI", room: "503" },
          { subject: "Ban", teacherCode: "MS", room: "503" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Ban", teacherCode: "MN", room: "503" },
          { subject: "Chem", teacherCode: "MRN", room: "503" },
          { subject: "Eng", teacherCode: "IHT", room: "503" },
          { subject: "Physics", teacherCode: "TU", room: "503" }
        ]
      },
      {
        sectionId: "11BST", className: "Class 11", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Stat/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "Ban", teacherCode: "MHA", room: "504" },
          { subject: "AccT", teacherCode: "MHN", room: "504" },
          { subject: "Acc", teacherCode: "MHN", room: "504" },
          { subject: "BOM", teacherCode: "MHK", room: "504" },
          { subject: "FBI", teacherCode: "TAH", room: "504" },
          { subject: "Eng", teacherCode: "RHR", room: "504" }
        ]
      },
      {
        sectionId: "12A", className: "Class 12", sectionName: "A", isActive: true,
        periods: [
          { subject: "Phy", teacherCode: "NC", room: "601" },
          { subject: "Biol/Stat/Drw", teacherCode: "FAJ/YK/AAN", isPractical: true },
          { subject: "Chem-Prac", teacherCode: "GCS", isPractical: true },
          { subject: "Chem-Prac", teacherCode: "GCS", isPractical: true },
          { subject: "PHY", teacherCode: "ZI", room: "601" },
          { subject: "H.Math", teacherCode: "AA", room: "601" },
          { subject: "Eng", teacherCode: "ASM", room: "601" }
        ]
      },
      {
        sectionId: "12B", className: "Class 12", sectionName: "B", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MHM", room: "602" },
          { subject: "Stat/E&D", teacherCode: "YK/AAN", isPractical: true },
          { subject: "H.Math", teacherCode: "NR", room: "602" },
          { subject: "Eng", teacherCode: "SM", room: "602" },
          { subject: "Chem", teacherCode: "ZC", room: "602" },
          { subject: "H.Math", teacherCode: "SZK", room: "602" },
          { subject: "Physics", teacherCode: "NC", room: "602" }
        ]
      },
      {
        sectionId: "12C", className: "Class 12", sectionName: "C", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "H.Math", teacherCode: "SZK", room: "603" },
          { subject: "Bio-Prac", teacherCode: "SJ", isPractical: true },
          { subject: "Bio-P", teacherCode: "MSF", isPractical: true },
          { subject: "Biology", teacherCode: "FAJ", room: "603" },
          { subject: "Physics", teacherCode: "ZI", room: "603" },
          { subject: "Eng", teacherCode: "SM", room: "603" }
        ]
      },
      {
        sectionId: "12BST", className: "Class 12", sectionName: "BST", isActive: true,
        periods: [
          { subject: "FBI", teacherCode: "TAH", room: "604" },
          { subject: "Stat/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "Ban", teacherCode: "MN", room: "604" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Acc", teacherCode: "MHN", room: "604" },
          { subject: "Acc", teacherCode: "MHN", room: "604" },
          { subject: "BOM", teacherCode: "MHK", room: "604" }
        ]
      }
    ]
  },
  {
    day: "Wednesday",
    dateFormatted: "16 September 2026",
    sections: [
      {
        sectionId: "6A", className: "Class 6", sectionName: "A", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "AA", room: "201" },
          { subject: "Art", teacherCode: "IJT", room: "201" },
          { subject: "Ban", teacherCode: "CM", room: "201" },
          { subject: "Math", teacherCode: "TIM", room: "201" },
          { subject: "BGS", teacherCode: "TAM", room: "201" },
          { subject: "Eng 1", teacherCode: "IHT", room: "201" },
          null
        ]
      },
      {
        sectionId: "6B", className: "Class 6", sectionName: "B", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "NR", room: "202" },
          { subject: "Ban", teacherCode: "CM", room: "202" },
          { subject: "Lang_L", teacherCode: "ARH", room: "Lang Lab" },
          { subject: "Lib", teacherCode: "AAM", room: "Library" },
          { subject: "Math", teacherCode: "TIM", room: "202" },
          { subject: "Rst", teacherCode: "AB/DRD", room: "202" },
          null
        ]
      },
      {
        sectionId: "6C", className: "Class 6", sectionName: "C", isActive: true,
        periods: [
          { subject: "Rst", teacherCode: "AB", room: "203" },
          { subject: "Sci", teacherCode: "SRY", room: "203" },
          { subject: "Libr", teacherCode: "AAM", room: "Library" },
          { subject: "Ban", teacherCode: "DR", room: "203" },
          { subject: "BGS", teacherCode: "LB", room: "203" },
          { subject: "Math", teacherCode: "TIM", room: "203" },
          null
        ]
      },
      {
        sectionId: "7A", className: "Class 7", sectionName: "A", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "TIM", room: "204" },
          { subject: "Ban", teacherCode: "DR", room: "204" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Eng 2", teacherCode: "ASM", room: "204" },
          { subject: "Eng 1", teacherCode: "KI", room: "204" },
          { subject: "Sci", teacherCode: "ZC", room: "204" },
          null
        ]
      },
      {
        sectionId: "7B", className: "Class 7", sectionName: "B", isActive: true,
        periods: [
          { subject: "Sci", teacherCode: "UFC", room: "205" },
          { subject: "Math", teacherCode: "NR", room: "205" },
          { subject: "Eng 1", teacherCode: "KI", room: "205" },
          { subject: "Sci", teacherCode: "ZC", room: "205" },
          { subject: "Lang_L", teacherCode: "ARH", room: "Lang Lab" },
          { subject: "Ban", teacherCode: "CM", room: "205" },
          null
        ]
      },
      {
        sectionId: "7C", className: "Class 7", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "RTM", room: "206" },
          { subject: "Math", teacherCode: "TIM", room: "206" },
          { subject: "BGS", teacherCode: "SA", room: "206" },
          { subject: "Agri/H.Sci", teacherCode: "SRY/UFC", room: "206" },
          { subject: "Ban", teacherCode: "DR", room: "206" },
          { subject: "Lan_L", teacherCode: "ARH", room: "Lang Lab" },
          null
        ]
      },
      {
        sectionId: "8A", className: "Class 8", sectionName: "A", isActive: true, statusReason: "Exam Day",
        periods: [
          { subject: "Sci Exam", teacherCode: "IJT", isExam: true },
          { subject: "Rev.", teacherCode: "SJB" },
          { subject: "BGS Exam", teacherCode: "MN", isExam: true },
          { subject: "Bang 2", teacherCode: "MSA", room: "301" },
          { subject: "Eng 2", teacherCode: "SM", room: "301" },
          { subject: "Sci", teacherCode: "SJ", room: "301" },
          { subject: "Math", teacherCode: "NR", room: "301" }
        ]
      },
      {
        sectionId: "8B", className: "Class 8", sectionName: "B", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "KI", room: "302" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "BGS", teacherCode: "TAM", room: "302" },
          { subject: "Math", teacherCode: "LYM", room: "302" },
          { subject: "Ban", teacherCode: "CM", room: "302" },
          { subject: "Sci", teacherCode: "MZI", room: "302" },
          null
        ]
      },
      {
        sectionId: "8C", className: "Class 8", sectionName: "C", isActive: true,
        periods: [
          { subject: "Sci", teacherCode: "ZC", room: "303" },
          { subject: "Math", teacherCode: "AA", room: "303" },
          { subject: "Eng 2", teacherCode: "RHR", room: "303" },
          { subject: "Eng 1", teacherCode: "RTM", room: "303" },
          { subject: "Sci", teacherCode: "MSF", room: "303" },
          { subject: "BGS", teacherCode: "LB", room: "303" },
          null
        ]
      },
      {
        sectionId: "9A", className: "Class 9", sectionName: "A", isActive: true,
        periods: [
          { subject: "Bio", teacherCode: "SJ", room: "304" },
          { subject: "Ban", teacherCode: "MHM", room: "304" },
          { subject: "R.St", teacherCode: "AB", room: "304" },
          { subject: "H.Math", teacherCode: "MNI", room: "304" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "H.Math", teacherCode: "SZK", room: "304" },
          { subject: "Eng 1", teacherCode: "MAM", room: "304" }
        ]
      },
      {
        sectionId: "9B", className: "Class 9", sectionName: "B", isActive: true,
        periods: [
          { subject: "Physics", teacherCode: "NC", room: "305" },
          { subject: "Rst", teacherCode: "AAB/DRD", room: "305" },
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Ban", teacherCode: "MHM", room: "305" },
          { subject: "BGS", teacherCode: "MU", room: "305" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Biology", teacherCode: "FAJ", room: "305" }
        ]
      },
      {
        sectionId: "9C", className: "Class 9", sectionName: "C", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "LYM", room: "306" },
          { subject: "Ban", teacherCode: "MS", room: "306" },
          { subject: "H.Math", teacherCode: "ZUR", room: "306" },
          { subject: "Chemistry", teacherCode: "MZI", room: "306" },
          { subject: "Rst", teacherCode: "AAB", room: "306" },
          { subject: "BGS", teacherCode: "MU", room: "306" },
          { subject: "Eng 1", teacherCode: "KI", room: "306" }
        ]
      },
      {
        sectionId: "9Bstd", className: "Class 9", sectionName: "Bstd", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MSA", room: "307" },
          { subject: "Rst", teacherCode: "RMMH/DRD", room: "307" },
          { subject: "B En.", teacherCode: "MHK", room: "307" },
          { subject: "Science", teacherCode: "FAJ", room: "307" },
          { subject: "Eng 2", teacherCode: "RTM", room: "307" },
          { subject: "Eng 1", teacherCode: "ASM", room: "307" },
          { subject: "Agr/H.Sci", teacherCode: "SA/DR", room: "307" }
        ]
      },
      {
        sectionId: "10A", className: "Class 10", sectionName: "A", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MHM", room: "401" },
          { subject: "Chem-Prac", teacherCode: "MRN", isPractical: true },
          { subject: "Eng 2", teacherCode: "SM", room: "401" },
          { subject: "Rst", teacherCode: "RMMH", room: "401" },
          { subject: "Math", teacherCode: "AA", room: "401" },
          { subject: "Physics", teacherCode: "TU", room: "401" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" }
        ]
      },
      {
        sectionId: "10B", className: "Class 10", sectionName: "B", isActive: true,
        periods: [
          { subject: "Physics-P", teacherCode: "TU", isPractical: true },
          { subject: "Physics", teacherCode: "TU", room: "402" },
          { subject: "Chem-Prac", teacherCode: "MZI", isPractical: true },
          { subject: "BGS", teacherCode: "MU", room: "402" },
          { subject: "Math", teacherCode: "LYM", room: "402" },
          { subject: "Maths", teacherCode: "ZUR", room: "402" },
          { subject: "R.St", teacherCode: "RMMH", room: "402" }
        ]
      },
      {
        sectionId: "10C", className: "Class 10", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "MAM", room: "403" },
          { subject: "Biology", teacherCode: "SJ", room: "403" },
          { subject: "Math", teacherCode: "SZK", room: "403" },
          { subject: "Eng 1", teacherCode: "IHT", room: "403" },
          { subject: "H.Math", teacherCode: "ZUR", room: "403" },
          { subject: "Bio", teacherCode: "FAJ", room: "403" },
          { subject: "Ban", teacherCode: "MHM", room: "403" }
        ]
      },
      {
        sectionId: "10BST", className: "Class 10", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MN", room: "404" },
          { subject: "Accounting", teacherCode: "MHN", room: "404" },
          { subject: "FBI", teacherCode: "TAH", room: "404" },
          { subject: "Math", teacherCode: "ZUR", room: "404" },
          { subject: "Eng 2", teacherCode: "ASM", room: "404" },
          { subject: "B En.", teacherCode: "MHK", room: "404" },
          { subject: "Eng 1", teacherCode: "RTM", room: "404" }
        ]
      },
      {
        sectionId: "11A", className: "Class 11", sectionName: "A", isActive: true,
        periods: [
          { subject: "Chemistry", teacherCode: "MRN", room: "501" },
          { subject: "H.Math", teacherCode: "LYM", room: "501" },
          { subject: "Ban", teacherCode: "MHA", room: "501" },
          { subject: "Physics", teacherCode: "NC", room: "501" },
          { subject: "Biology/Stat/Drw", teacherCode: "SJ/YK/AAN", isPractical: true },
          { subject: "Physics", teacherCode: "ZI", room: "501" },
          { subject: "Ban", teacherCode: "MN", room: "501" }
        ]
      },
      {
        sectionId: "11B", className: "Class 11", sectionName: "B", isActive: true,
        periods: [
          { subject: "H.Math", teacherCode: "MNI", room: "502" },
          { subject: "H.Math", teacherCode: "SZK", room: "502" },
          { subject: "Chemistry", teacherCode: "GCS", room: "502" },
          { subject: "H.Math", teacherCode: "NR", room: "502" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Physics", teacherCode: "NC", room: "502" },
          { subject: "Stat/Drw", teacherCode: "YK/AAN", isPractical: true }
        ]
      },
      {
        sectionId: "11C", className: "Class 11", sectionName: "C", isActive: true,
        periods: [
          { subject: "Chem", teacherCode: "ZC", room: "503" },
          { subject: "Phy", teacherCode: "ZI", room: "503" },
          { subject: "Eng", teacherCode: "IHT", room: "503" },
          { subject: "Bio", teacherCode: "MSF", room: "503" },
          { subject: "Math", teacherCode: "SZK", room: "503" },
          { subject: "Math", teacherCode: "MNI", room: "503" },
          { subject: "Ban", teacherCode: "MHA", room: "503" }
        ]
      },
      {
        sectionId: "11BST", className: "Class 11", sectionName: "BST", isActive: true,
        periods: [
          { subject: "BOM", teacherCode: "MHK", room: "504" },
          { subject: "Acc", teacherCode: "MHN", room: "504" },
          { subject: "Ban", teacherCode: "MSA", room: "504" },
          { subject: "Stat/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "FBI", teacherCode: "TAH", room: "504" },
          { subject: "Eng", teacherCode: "RHR", room: "504" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" }
        ]
      },
      {
        sectionId: "12A", className: "Class 12", sectionName: "A", isActive: true,
        periods: [
          { subject: "Eng", teacherCode: "SM", room: "601" },
          { subject: "H.Math", teacherCode: "AA", room: "601" },
          { subject: "Physics", teacherCode: "ZI", room: "601" },
          { subject: "Chemistry", teacherCode: "MZI", room: "601" },
          { subject: "Bio/Stat/Drw", teacherCode: "SJ/YK/AAN", isPractical: true },
          { subject: "Chem", teacherCode: "MRN", room: "601" },
          { subject: "Ban", teacherCode: "MHA", room: "601" }
        ]
      },
      {
        sectionId: "12B", className: "Class 12", sectionName: "B", isActive: true,
        periods: [
          { subject: "Physics", teacherCode: "NC", room: "602" },
          { subject: "Chem", teacherCode: "MRN", room: "602" },
          { subject: "Eng", teacherCode: "SM", room: "602" },
          { subject: "H.Math", teacherCode: "NR", room: "602" },
          { subject: "Stat/Drw", teacherCode: "YK/AAN", isPractical: true },
          { subject: "Chemistry", teacherCode: "ZC", room: "602" },
          { subject: "Physics", teacherCode: "TU", room: "602" }
        ]
      },
      {
        sectionId: "12C", className: "Class 12", sectionName: "C", isActive: true,
        periods: [
          { subject: "Physics", teacherCode: "TU", room: "603" },
          { subject: "Chemistry", teacherCode: "GCS", room: "603" },
          { subject: "H.Math", teacherCode: "SZK", room: "603" },
          { subject: "Bio", teacherCode: "MSF", room: "603" },
          { subject: "Eng", teacherCode: "MAM", room: "603" },
          { subject: "Ban", teacherCode: "MN", room: "603" },
          { subject: "H.Math", teacherCode: "ZUR", room: "603" }
        ]
      },
      {
        sectionId: "12BST", className: "Class 12", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Acc", teacherCode: "MHN", room: "604" },
          { subject: "BOM", teacherCode: "MHK", room: "604" },
          { subject: "FBI", teacherCode: "TAH", room: "604" },
          { subject: "Stat/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "Ban", teacherCode: "MS", room: "604" },
          { subject: "Eng", teacherCode: "RHR", room: "604" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" }
        ]
      }
    ]
  },
  {
    day: "Thursday",
    dateFormatted: "17 September 2026",
    sections: [
      {
        sectionId: "6A", className: "Class 6", sectionName: "A", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "DR", room: "201" },
          { subject: "Rst", teacherCode: "AB", room: "201" },
          { subject: "Eng 2", teacherCode: "RTM", room: "201" },
          { subject: "Lib", teacherCode: "AAM", room: "Library" },
          { subject: "Sci", teacherCode: "SRY", room: "201" },
          { subject: "Maths", teacherCode: "AAN", room: "201" },
          null
        ]
      },
      {
        sectionId: "6B", className: "Class 6", sectionName: "B", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Maths", teacherCode: "AAN", room: "202" },
          { subject: "Eng 1", teacherCode: "ASM", room: "202" },
          { subject: "Eng 2", teacherCode: "KI", room: "202" },
          { subject: "Math", teacherCode: "TIM", room: "202" },
          { subject: "Ban", teacherCode: "MHM", room: "202" },
          null
        ]
      },
      {
        sectionId: "6C", className: "Class 6", sectionName: "C", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "TIM", room: "203" },
          { subject: "Ban", teacherCode: "MHM", room: "203" },
          { subject: "Arts", teacherCode: "IJT", room: "203" },
          { subject: "Eng 1", teacherCode: "ASM", room: "203" },
          { subject: "BGS", teacherCode: "TAM", room: "203" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          null
        ]
      },
      {
        sectionId: "7A", className: "Class 7", sectionName: "A", isActive: true,
        periods: [
          { subject: "Eng 1", teacherCode: "KI", room: "204" },
          { subject: "Ban", teacherCode: "DR", room: "204" },
          { subject: "L-Lab", teacherCode: "ARH", room: "Lang Lab" },
          { subject: "Math", teacherCode: "TIM", room: "204" },
          { subject: "Rst", teacherCode: "AB", room: "204" },
          { subject: "Sci", teacherCode: "FAJ", room: "204" },
          null
        ]
      },
      {
        sectionId: "7B", className: "Class 7", sectionName: "B", isActive: true,
        periods: [
          { subject: "Sci", teacherCode: "FAJ", room: "205" },
          { subject: "Eng 2", teacherCode: "RTM", room: "205" },
          { subject: "Eng 1", teacherCode: "KI", room: "205" },
          { subject: "Ban", teacherCode: "CM", room: "205" },
          { subject: "Sci", teacherCode: "ZC", room: "205" },
          { subject: "Lib", teacherCode: "AAM", room: "Library" },
          null
        ]
      },
      {
        sectionId: "7C", className: "Class 7", sectionName: "C", isActive: true,
        periods: [
          { subject: "Eng 2", teacherCode: "ASM", room: "206" },
          { subject: "BGS", teacherCode: "SA", room: "206" },
          { subject: "Rst", teacherCode: "AB", room: "206" },
          { subject: "Ban", teacherCode: "DR(B)", room: "206" },
          { subject: "Sci", teacherCode: "UFC", room: "206" },
          { subject: "Math", teacherCode: "TIM", room: "206" },
          null
        ]
      },
      {
        sectionId: "8A", className: "Class 8", sectionName: "A", isActive: true, statusReason: "Exam Day",
        periods: [
          { subject: "Eng 2 Exam", teacherCode: "SJB", isExam: true },
          { subject: "Rev.", teacherCode: "FAJ" },
          { subject: "Bang 2 Exam", teacherCode: "CM", isExam: true },
          { subject: "Math", teacherCode: "NR", room: "301" },
          { subject: "Bang 1", teacherCode: "MHM", room: "301" },
          { subject: "Eng 1", teacherCode: "MAM", room: "301" },
          { subject: "BGS", teacherCode: "MU", room: "301" }
        ]
      },
      {
        sectionId: "8B", className: "Class 8", sectionName: "B", isActive: true,
        periods: [
          { subject: "Rst", teacherCode: "RMMH/DRD", room: "302" },
          { subject: "Math", teacherCode: "NR", room: "302" },
          { subject: "Sci", teacherCode: "ZC", room: "302" },
          { subject: "Eng 2", teacherCode: "IHT", room: "302" },
          { subject: "Eng 1", teacherCode: "RTM", room: "302" },
          { subject: "Ban", teacherCode: "DR", room: "302" },
          null
        ]
      },
      {
        sectionId: "8C", className: "Class 8", sectionName: "C", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "ZUR", room: "303" },
          { subject: "Eng 1", teacherCode: "RHR", room: "303" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "Eng 2", teacherCode: "MAM", room: "303" },
          { subject: "Sci", teacherCode: "MZI", room: "303" },
          { subject: "Ban", teacherCode: "CM", room: "303" },
          null
        ]
      },
      {
        sectionId: "9A", className: "Class 9", sectionName: "A", isActive: true,
        periods: [
          { subject: "BGS", teacherCode: "TAM", room: "304" },
          { subject: "Ban", teacherCode: "MHA", room: "304" },
          { subject: "Eng 2", teacherCode: "RHR", room: "304" },
          { subject: "Bang", teacherCode: "MHM", room: "304" },
          { subject: "Che", teacherCode: "MRN", room: "304" },
          { subject: "H.Math", teacherCode: "SZK", room: "304" },
          { subject: "Rst", teacherCode: "AAB", room: "304" }
        ]
      },
      {
        sectionId: "9B", className: "Class 9", sectionName: "B", isActive: true,
        periods: [
          { subject: "Math", teacherCode: "AA", room: "305" },
          { subject: "Ban", teacherCode: "MS", room: "305" },
          { subject: "Eng 2", teacherCode: "MAM", room: "305" },
          { subject: "BGS", teacherCode: "LB", room: "305" },
          { subject: "H.Maths", teacherCode: "NR", room: "305" },
          { subject: "Bio", teacherCode: "SJ", room: "305" },
          { subject: "Eng 1", teacherCode: "KI", room: "305" }
        ]
      },
      {
        sectionId: "9C", className: "Class 9", sectionName: "C", isActive: true,
        periods: [
          { subject: "Biology", teacherCode: "SJ", room: "306" },
          { subject: "BGS", teacherCode: "TAM", room: "306" },
          { subject: "R.St", teacherCode: "AAB", room: "306" },
          { subject: "Physics", teacherCode: "ZI", room: "306" },
          { subject: "Ban", teacherCode: "MN", room: "306" },
          { subject: "H.M", teacherCode: "MNI", room: "306" },
          { subject: "Eng 2", teacherCode: "ASM", room: "306" }
        ]
      },
      {
        sectionId: "9Bstd", className: "Class 9", sectionName: "Bstd", isActive: true,
        periods: [
          { subject: "Acc", teacherCode: "MHN", room: "307" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Ban", teacherCode: "MN", room: "307" },
          { subject: "Math", teacherCode: "LYM", room: "307" },
          { subject: "Ban", teacherCode: "MSA", room: "307" },
          { subject: "Eng 2", teacherCode: "RTM", room: "307" },
          { subject: "Agri/H.Sci", teacherCode: "SRY/UFC", room: "307" }
        ]
      },
      {
        sectionId: "10A", className: "Class 10", sectionName: "A", isActive: true,
        periods: [
          { subject: "H.Math", teacherCode: "SZK", room: "401" },
          { subject: "Eng 1", teacherCode: "IHT", room: "401" },
          { subject: "Rst", teacherCode: "RMMH", room: "401" },
          { subject: "H.Math", teacherCode: "MNI", room: "401" },
          { subject: "BGS", teacherCode: "MU", room: "401" },
          { subject: "Bio", teacherCode: "MSF", room: "401" },
          { subject: "Math", teacherCode: "LYM", room: "401" }
        ]
      },
      {
        sectionId: "10B", className: "Class 10", sectionName: "B", isActive: true,
        periods: [
          { subject: "Chemistry", teacherCode: "MRN", room: "402" },
          { subject: "Biology-Prac", teacherCode: "SJ", isPractical: true },
          { subject: "BGS", teacherCode: "LB", room: "402" },
          { subject: "P.Edu/C.Edu", teacherCode: "SJB,IJT", room: "Ground" },
          { subject: "Eng 1", teacherCode: "KI", room: "402" },
          { subject: "Ban", teacherCode: "MS", room: "402" },
          { subject: "Eng 2", teacherCode: "IHT", room: "402" }
        ]
      },
      {
        sectionId: "10C", className: "Class 10", sectionName: "C", isActive: true,
        periods: [
          { subject: "Ban", teacherCode: "MSA", room: "403" },
          { subject: "Math", teacherCode: "SZK", room: "403" },
          { subject: "Bio-Prac", teacherCode: "MSF", isPractical: true },
          { subject: "Rst", teacherCode: "RMMH/DRD", room: "403" },
          { subject: "Chemistry", teacherCode: "GCS", room: "403" },
          { subject: "BGS", teacherCode: "LB", room: "403" },
          { subject: "H.Math", teacherCode: "ZUR", room: "403" }
        ]
      },
      {
        sectionId: "10BST", className: "Class 10", sectionName: "BST", isActive: true,
        periods: [
          { subject: "ICT", teacherCode: "MRC", room: "Lab 1" },
          { subject: "Agri/H.Sci", teacherCode: "SRY/UFC", room: "404" },
          { subject: "G.Math", teacherCode: "YK", room: "404" },
          { subject: "Rst", teacherCode: "AAB/DRD", room: "404" },
          { subject: "Sci", teacherCode: "ZI", room: "404" },
          { subject: "Ban", teacherCode: "MN", room: "404" },
          { subject: "SCI", teacherCode: "ZC", room: "404" }
        ]
      },
      {
        sectionId: "11A", className: "Class 11", sectionName: "A", isActive: true,
        periods: [
          { subject: "Eng", teacherCode: "IHT", room: "501" },
          { subject: "Chem", teacherCode: "MZI", room: "501" },
          { subject: "Physics", teacherCode: "NC", room: "501" },
          { subject: "ICT", teacherCode: "FF", room: "Lab 2" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" },
          { subject: "Chem", teacherCode: "GCS", room: "501" },
          { subject: "Bio/Stat/Drw", teacherCode: "MSF/YK/AAN", isPractical: true }
        ]
      },
      {
        sectionId: "11B", className: "Class 11", sectionName: "B", isActive: true,
        periods: [
          { subject: "Eng", teacherCode: "SM", room: "502" },
          { subject: "Chem", teacherCode: "ZC", room: "502" },
          { subject: "H.Math", teacherCode: "NR", room: "502" },
          { subject: "Chemistry", teacherCode: "MRN", room: "502" },
          { subject: "H.Math", teacherCode: "SZK", room: "502" },
          { subject: "Physics", teacherCode: "TU", room: "502" },
          { subject: "Bio/Stat/Drw", teacherCode: "FAJ/YK/AAN", isPractical: true }
        ]
      },
      {
        sectionId: "11C", className: "Class 11", sectionName: "C", isActive: true,
        periods: [
          { subject: "Bio", teacherCode: "MSF", room: "503" },
          { subject: "Ban", teacherCode: "MN", room: "503" },
          { subject: "Chem", teacherCode: "MRN", room: "503" },
          { subject: "Physics", teacherCode: "ZI", room: "503" },
          { subject: "H.Math", teacherCode: "MNI", room: "503" },
          { subject: "Eng", teacherCode: "RHR", room: "503" },
          { subject: "Physics", teacherCode: "NC", room: "503" }
        ]
      },
      {
        sectionId: "11BST", className: "Class 11", sectionName: "BST", isActive: true,
        periods: [
          { subject: "Accounting", teacherCode: "MHN", room: "504" },
          { subject: "FBI", teacherCode: "TAH", room: "504" },
          { subject: "Eng", teacherCode: "RHR", room: "504" },
          { subject: "Ban", teacherCode: "MHM", room: "504" },
          { subject: "BOM", teacherCode: "MHK", room: "504" },
          { subject: "Stat/Agri", teacherCode: "YK/SA", isPractical: true },
          { subject: "BOM", teacherCode: "MHK", room: "504" }
        ]
      },
      {
        sectionId: "12A", className: "Class 12", sectionName: "A", isActive: true,
        periods: [
          { subject: "Physics", teacherCode: "NC", room: "601" },
          { subject: "Chemistry", teacherCode: "MRN", room: "601" },
          { subject: "H.Math", teacherCode: "AA", room: "601" },
          { subject: "Bio", teacherCode: "FAJ", room: "601" },
          { subject: "Eng", teacherCode: "ASM", room: "601" },
          { subject: "Ban", teacherCode: "MSA", room: "601" },
          { subject: "Physics", teacherCode: "ZI", room: "601" }
        ]
      },
      {
        sectionId: "12B", className: "Class 12", sectionName: "B", isActive: true,
        periods: [
          { subject: "H.Math", teacherCode: "NR", room: "602" },
          { subject: "Chem", teacherCode: "MZI", room: "602" },
          { subject: "Physics", teacherCode: "TU", room: "602" },
          { subject: "Eng", teacherCode: "SM", room: "602" },
          { subject: "Ban", teacherCode: "MHA", room: "602" },
          { subject: "H.Math", teacherCode: "SZK", room: "602" },
          { subject: "Chem", teacherCode: "GCS", room: "602" }
        ]
      },
      {
        sectionId: "12C", className: "Class 12", sectionName: "C", isActive: true,
        periods: [
          { subject: "Chem", teacherCode: "GCS", room: "603" },
          { subject: "Physics", teacherCode: "ZI", room: "603" },
          { subject: "Ban", teacherCode: "MSA", room: "603" },
          { subject: "H.Math", teacherCode: "MNI", room: "603" },
          { subject: "Bio", teacherCode: "SJ", room: "603" },
          { subject: "Chemistry", teacherCode: "MRN", room: "603" },
          { subject: "H.Math", teacherCode: "ZUR", room: "603" }
        ]
      },
      {
        sectionId: "12BST", className: "Class 12", sectionName: "BST", isActive: true,
        periods: [
          { subject: "BOM", teacherCode: "MHK", room: "604" },
          { subject: "Accounting", teacherCode: "MHN", room: "604" },
          { subject: "FBI", teacherCode: "TAH", room: "604" },
          { subject: "Ban", teacherCode: "MS", room: "604" },
          { subject: "Stat/Agri", teacherCode: "YK/SRY", isPractical: true },
          { subject: "Eng", teacherCode: "MAM", room: "604" },
          { subject: "ICT", teacherCode: "RAI", room: "Lab 3" }
        ]
      }
    ]
  }
];
