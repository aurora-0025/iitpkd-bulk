import { Injectable, PipeTransform } from "@angular/core";

import { BehaviorSubject, Observable, of, Subject } from "rxjs";

import { DecimalPipe } from "@angular/common";
import { debounceTime, delay, switchMap, tap } from "rxjs/operators";
import { SortColumn, SortDirection } from "./sortable.directive";
import schema, { Course } from "../../couse-list-validator";
import { ValidationError } from "yup";

interface SearchResult {
  courses: Course[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  showOnlyErrors: boolean;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(
  courses: Course[],
  column: SortColumn,
  direction: string
): Course[] {
  if (direction === "" || column === "") {
    return courses;
  } else {
    return [...courses].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === "asc" ? res : -res;
    });
  }
}

function matches(course: Course, term: string, pipe: PipeTransform) {
  return Object.values(course).some((value) =>
    (value ?? "").toString().toLowerCase().includes(term.toLowerCase())
  );
}

@Injectable({ providedIn: "root" })
export class CourseListService {
  private _courseList: Course[] = [];
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _courses$ = new BehaviorSubject<Course[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _totalValid$ = new BehaviorSubject<number>(0);
  private _totalInvalid$ = new BehaviorSubject<number>(-1);

  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: "",
    sortColumn: "",
    sortDirection: "",
    showOnlyErrors: false,
  };

  constructor(private pipe: DecimalPipe) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._courses$.next(result.courses);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  get courses$() {
    return this._courses$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }

  get totalInvalid$() {
    return this._totalInvalid$.asObservable();
  }

  get totalValid$() {
    return this._totalValid$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }

  get showOnlyErrors() {
    return this._state.showOnlyErrors;
  }

  get courseList() {
    return this._courseList;
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  set showOnlyErrors(showOnlyErrors: boolean) {
    this._set({ showOnlyErrors });
  }

  set courseList(cl: Course[]) {
    this._courseList = cl;
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const {
      sortColumn,
      sortDirection,
      pageSize,
      page,
      searchTerm,
      showOnlyErrors,
    } = this._state;

    let courses = sort(this._courseList, sortColumn, sortDirection);
    let total = courses.length;
    if (total > 0) {
      const totalInvalid = courses.filter((v) => v["status"] == "WARNING").length;
      const totalLoading = courses.filter((v) => v["status"] == "LOADING").length;
      if (totalLoading == 0) {
        this._totalInvalid$.next(totalInvalid);
        this._totalValid$.next(total - totalInvalid);

        if (showOnlyErrors) {
          courses = courses.filter((course) => course["status"] == "WARNING");
        }
        courses = courses.filter((course) =>
          matches(course, searchTerm, this.pipe)
        );

        total = courses.length;

        courses = courses.slice(
          (page - 1) * pageSize,
          (page - 1) * pageSize + pageSize
        );
      }
    }

    return of({ courses, total });
  }

  async parseRow(row: Course) {
    setTimeout(async () => {
      try {
        row["statusText"] = {};
        await schema.validate(row, { abortEarly: false });
        row["status"] = "SUCCESS";
      } catch (error: unknown) {
        if (error instanceof ValidationError) {
          row["status"] = "WARNING";
          if (error.inner.length > 0) {
            error.inner.forEach((e) => {
              if (e.path) row["statusText"]![e.path] = e.message;
            });
          } else {
            if (error.path) row["statusText"]![error.path] = error.message;
          }
        }
      }
      this._search$.next();
    }, 500);
  }
}
