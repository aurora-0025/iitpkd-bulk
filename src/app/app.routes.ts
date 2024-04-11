import { Routes } from "@angular/router";
import { UploadCourseListComponent } from "./pages/home/register-course/upload-course-list/upload-course-list.component";
import { RegisterCourseComponent } from "./pages/home/register-course/register-course.component";
import { HomeComponent } from "./pages/home/home.component";

export const routes: Routes = [
  {
    path: "",
    title: "home",
    component: HomeComponent,
  },
  {
    path: "register-course",
    title: "Register Course",
    component: RegisterCourseComponent,
  },
  { path: "register-course/upload", component: UploadCourseListComponent },
];
