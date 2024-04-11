import { Component } from "@angular/core";
import { FileDragNDropDirective } from "./file-drag-n-drop.directive";
import { CommonModule } from "@angular/common";
import { read, utils, writeFile } from "xlsx";
import { NgbdTableComplete } from "./components/course-list-table/course-list-table.component";
import { Course, tableHeaders } from "./couse-list-validator";
import { NgbProgressbar, NgbToast } from "@ng-bootstrap/ng-bootstrap";
import { RouterModule } from "@angular/router";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: "app-upload-course-list",
  standalone: true,
  templateUrl: "./upload-course-list.component.html",
  imports: [
    FileDragNDropDirective,
    CommonModule,
    NgbdTableComplete,
    NgbProgressbar,
    NgbToast,
    RouterModule,
  ],
})
export class UploadCourseListComponent {
  public file: File | null = null;
  public showProgress: boolean = false;
  public progress: number = 0;
  public currentPage = 0;
  public rows: Course[] = [];
  public showToast = false;

  onFileChange(file: File) {
    this.file = file;
    if (!this.checkfileType(this.file)) {
      this.file = null;
      return;
    }
    this.showProgressBar(this.file!);
  }

  changePage(pageNo: number, reset?: boolean) {
    this.currentPage = pageNo;
    if (pageNo == 0) {
      this.file = null;
      if (reset) {
        this.rows = [];
      }
      this.showProgress = false;
    } else if (pageNo == 2) {
      this.showUploadProgressBar();
    }
  }

  resetData() {
    this.file = null;
    this.rows = [];
  }

  onFileInputChange(e: Event) {
    let l_fileEvent = e as HTMLInputEvent;
    this.file = l_fileEvent.target.files && l_fileEvent.target.files[0];
    if (this.file && !this.checkfileType(this.file)) {
      this.file = null;
      return;
    }
    this.showProgressBar(this.file!);
  }

  private checkfileType(file: File) {
    let l_validExts = new Array(".xlsx", ".xls", ".csv");
    let l_fileExt = file.name;
    l_fileExt = l_fileExt.substring(l_fileExt.lastIndexOf("."));
    if (l_validExts.indexOf(l_fileExt) < 0) {
      alert(
        "Invalid file selected, valid files are of " +
          l_validExts.toString() +
          " types."
      );
      return false;
    } else return true;
  }

  showUploadProgressBar() {
    this.showProgress = true;
    this.progress = 0;
    const filtered = this.rows
      .filter((row) => row["status"] == "SUCCESS")
      .map((c) => {
        delete c["statusText"];
        delete c["status"];
        delete c["id"];
        return c;
      });
    const delay = 100;
    const increment = Math.ceil(100 / filtered.length);

    for (let i = 0; i < filtered.length; i++) {
      setTimeout(() => {
        this.progress += increment;

        if (i === filtered.length - 1) {
          this.progress = 100;
          const jsonData = JSON.stringify(filtered, null, 2);
          this.downloadJson(jsonData);
        }
      }, i * delay);
    }
  }

  downloadTemplate(fileType: "csv" | "xlsx") {
    const workbook = utils.book_new();
    const data = [
      tableHeaders,
      [
        "B.Sc, Physics",
        "5",
        "Core",
        "PH5502",
        "Quantum Mechanics",
        "3-1-0-4",
        "Rakesh Kumar",
        "B",
        "P 203",
        "A",
        "EXAMPLE",
      ],
    ];
    const worksheet = utils.aoa_to_sheet(data);
    utils.book_append_sheet(workbook, worksheet, "template");
    writeFile(workbook, `template.${fileType}`, { compression: true });
  }

  private downloadJson(json: string) {
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "out.json";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  showProgressBar(file: File) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadstart = () => {
      this.showProgress = true;
      this.progress = 0;
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        this.progress = Math.round((event.loaded / event.total) * 100);
      }
    };

    reader.onerror = function () {
      console.log("There was an issue reading the file." + reader.error);
    };

    reader.onload = (_e) => {
      this.showProgress = false;
      this.progress = 0;
      let l_data = reader.result;
      let l_workbook = read(l_data);
      let l_worksheet = l_workbook.Sheets[l_workbook.SheetNames[0]];
      const l_row_data = utils.sheet_to_json<Course>(l_worksheet);

      l_row_data.forEach((row, i) => {
        let values = Object.values(row);
        if (values[values.length - 1] == "EXAMPLE") return;
        let updated_id =
          row["id"] !== undefined && row["id"] < this.rows.length
            ? row["id"]
            : this.rows.length + 1;
        row["id"] = updated_id;
        this.rows[row["id"]! - 1] = row;
      });

      const l_headers: string[] = [];
      for (let colIndex = 0; ; colIndex++) {
        const l_cellAddress = utils.encode_cell({ r: 0, c: colIndex });
        const l_cell = l_worksheet[l_cellAddress];
        if (!l_cell || !l_cell.v) {
          break;
        }
        if (l_cell.v != "id") {
          l_headers.push(l_cell.v);
        }
      }
      
      const hasAllCourseColumns =
        tableHeaders.every((key) => l_headers.includes(key)) &&
        l_headers.every((header) => tableHeaders.includes(header));
      if (!hasAllCourseColumns) {
        this.file = null;
        this.rows = [];
        alert("The Uploaded File Does Not Have The Required Columns");
      } else if (this.rows.length == 0) {
        this.file = null;
        alert("No valid rows found in the uploaded file");
      } else {
        this.currentPage = 1;
        this.showToast = true;
      }
    };
  }

  getTotalInvalid() {
    return this.rows.filter((v) => v["status"] == "WARNING").length;
  }
}
