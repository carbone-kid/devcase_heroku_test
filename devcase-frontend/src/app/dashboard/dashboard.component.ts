import { Component, OnInit } from '@angular/core';
import { User } from '../shared/models/user.model';
import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  user: User;

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    // Gets the user object stored in the sessionStorage.
    // This user obj is not a GoogleUser obj but is out Backend's object
    this.user = this.authService.getSignedInUser();
  }
}
