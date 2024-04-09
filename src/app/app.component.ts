import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NgbCollapse } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NgbCollapse],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "course-registration";
  isMenuCollapsed = true;
}
