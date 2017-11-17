# SYTAC DEVCASE - Frontend code


Frontend part of the application built with Angular 4.3, Bootstrap 4.0.0.beta. 


## Prerequisites:
- nodejs
- npm
- mongodb
- git

## Instalation

Install globally Angular-CLI

    npm install -g @angular/cli

Clone the repository

    git clone https://github.com/sytac/devcase-portal.git

Navigate to the front end code folder:

    cd path/devcase-portal/frontend

Install dependencies using [npm](https://www.npmjs.com/)

    npm install
Run the App

    npm start

Run unit tests

    npm test

Run end-2-end tests

    ng e2e
    

## Technologies

 - Angular 4.3.6
 - TypeScript 2.5.1
 - Angular-CLI 1.3.2
 - Bootstrap 4.0.0-beta

## About the project

 - Single page App separated in 2 main Components: Form to add a new candidate and table with the list of repositories (DevCases).
 - Form: It is always displayed and it will trigger all the *under the hood magic* that will:
	 - Clone repository (a DevCase type, e.g. frontend)
	 - Mirror push it adding the candidate's username to the repository name
	 - Add the candidate as a collaborator
 - Table: It will display all the current repositories (DevCases) that we cloned with the previous step. Some considerations to be taken into account:
	 - This data is retrieved by our backend, not GitHub's API.
	 - Depending on the role of the logged in user we will display some action buttons.
	 - Binded to this table and it´s actions we´ll be sending notifications (via e-mail) to the people involved.

## Future implementations or improvements

 - Button for reviewers will currently navigate to Google Forms, an implementation would be to make it navigate with pre-filled data (candidate name and reviewer's account)
 - Once the reviewer submits the Google Forms form a webhook should trigger and set the DevCase to the "reviewed" state and, therefore, send a notification to the recruiter associated to this DevCase.
