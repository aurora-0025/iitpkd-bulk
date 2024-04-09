export class statusText {
  constructor() {
    this["Target Program Name"] = "";
    this["Semester"] = "";
    this["Course Type"] = "";
    this["Course Code"] = "";
    this["Course Name"] = "";
    this["Credits"] = "";
    this["Coordinator"] = "";
    this["Slot"] = "";
    this["Room"] = "";
    this["Batches"] = "";
  }
  [key: string]: string | undefined;
  "Target Program Name": string;
  Semester: string;
  "Course Type": string;
  "Course Code": string;
  "Course Name": string;
  Credits: string;
  Coordinator: string;
  Slot: string;
  Room: string;
  Batches: string;
}

export type Course = {
  [key: string]: string | number | any;
  id?: number;
  status?: "LOADING" | "SUCCESS" | "WARNING";
  rowStatusText?: string;
  statusText?: statusText;
  "Target Program Name": string;
  Semester: number;
  "Course Type": string;
  "Course Code": string;
  "Course Name": string;
  Credits: string;
  Coordinator: string;
  Slot: string;
  Room: string;
  Batches: string;
};
