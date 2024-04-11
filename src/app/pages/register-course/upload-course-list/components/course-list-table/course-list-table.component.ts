import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
  inject,
} from "@angular/core";
import { NgbdSortableHeader, SortEvent } from "./sortable.directive";
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  NgbHighlight,
  NgbPaginationModule,
  NgbPopoverModule,
  NgbModal,
  NgbAlert,
  NgbDropdownModule,
} from "@ng-bootstrap/ng-bootstrap";
import { DecimalPipe, AsyncPipe, CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { CourseListService } from "./course-list.service";
import { Course, tableHeaders } from "./couse-list-validator";
import { utils, writeFile } from "xlsx";

@Component({
  selector: "ngbd-table-complete",
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    AsyncPipe,
    NgbHighlight,
    NgbdSortableHeader,
    NgbPaginationModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPopoverModule,
    NgbAlert,
  ],
  templateUrl: "./course-list-table.component.html",
  styleUrls: ["./table-header-style.css"],
  providers: [CourseListService, DecimalPipe],
})
export class NgbdTableComplete implements OnInit {
  tableDataForm!: FormArray;
  courses$: Observable<Course[]>;
  total$: Observable<number>;
  totalInvalid$: Observable<number>;
  totalValid$: Observable<number>;
  tableHeaders!: string[];
  isUploading: boolean = false;
  private modalService = inject(NgbModal);
  @Output() goToPageEvent = new EventEmitter<number>();
  @Input() rowData!: Course[];

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  constructor(public service: CourseListService, private fb: FormBuilder) {
    this.courses$ = service.courses$;
    this.total$ = service.total$;
    this.totalInvalid$ = service.totalInvalid$;
    this.totalValid$ = service.totalValid$;
  }
  ngOnInit(): void {
    this.tableHeaders = tableHeaders;
    this.service.courseList = this.rowData;

    for (let i = 0; i < this.service.courseList.length; i++) {
      const element = this.service.courseList[i];
      element["status"] = "LOADING";
      element["statusText"] = {};
      this.service.parseRow(element);
    }
  }

  changePage(pageNo: number) {
    this.goToPageEvent.emit(pageNo);
  }

  downloadAllInvalid(fileType: "csv" | "xlsx") {
    const workbook = utils.book_new();
    const data = this.service.courseList;

    const filtered = data
      .filter((row) => row["status"] == "WARNING")
      .map(({ status, statusText, ...rest }) => rest);

    const worksheet = utils.json_to_sheet(filtered, {
      header: ["id", ...this.tableHeaders],
    });
    utils.book_append_sheet(workbook, worksheet, "InvalidRows");
    writeFile(workbook, `InvalidRows.${fileType}`, { compression: true });
  }

  openModal(content: TemplateRef<any>) {
    if (
      this.service.courseList.length ==
      this.service.courseList.filter((v) => v["status"] == "WARNING").length
    ) {
      alert("There are no valid rows");
    } else {
      this.modalService.open(content, { centered: true });
    }
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = "";
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
