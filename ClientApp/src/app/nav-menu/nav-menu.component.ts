import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  isExpanded = false;

  private user;
   
  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  ngOnInit()
  {
      console.log("Navigation Menu Component : Initialization");
      // get return url from route parameters or default to '/'
    
      this.user = localStorage.getItem('currentUser');
  }
}
