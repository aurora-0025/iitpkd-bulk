import { Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { UploadCourseListComponent } from "./pages/register-course/upload-course-list/upload-course-list.component";
import { RegisterCourseComponent } from "./pages/register-course/register-course.component";
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
