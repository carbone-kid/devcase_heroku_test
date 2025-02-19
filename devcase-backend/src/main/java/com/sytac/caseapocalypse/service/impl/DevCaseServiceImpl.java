package com.sytac.caseapocalypse.service.impl;

import com.sytac.caseapocalypse.dao.*;
import com.sytac.caseapocalypse.model.*;
import com.sytac.caseapocalypse.model.db.*;
import com.sytac.caseapocalypse.model.http.CreateDevcaseRequest;
import com.sytac.caseapocalypse.service.*;
import com.sytac.caseapocalypse.service.exception.DevCaseServiceException;
import com.sytac.caseapocalypse.service.exception.EmailCreatorServiceException;
import com.sytac.caseapocalypse.service.exception.GitHubServiceException;
import com.sytac.caseapocalypse.utils.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.*;

@Component
public class DevCaseServiceImpl implements DevCaseService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DevCaseServiceImpl.class);

    /**
     * The name of the Company
     */
    @Value("${github.company}")
    private String COMPANY;

    /**
     * The name of the project for the backend candidates
     */
    @Value("${github.project.backend}")
    private String PROJECT_BACKEND;

    /**
     * The name of the project for the frontend candidates
     */
    @Value("${github.project.frontend}")
    private String PROJECT_FRONTEND;

    /**
     * The name of the project for the android candidates
     */
    @Value("${github.project.android}")
    private String PROJECT_ANDROID;

    /**
     * The name of the team for the backend review
     */
    @Value("${github.team.backend}")
    private String TEAM_BACKEND;

    /**
     * The name of the team for the frontend review
     */
    @Value("${github.team.frontend}")
    private String TEAM_FRONTEND;

    /**
     * The name of the team for the android review
     */
    @Value("${github.team.android}")
    private String TEAM_ANDROID;

    /**
     * The url of the GitHub website
     */
    @Value("${github.url.website}")
    private String GITHUB_URL_WEBSITE;

    /**
     * The sender's username for sending the email
     */
    @Value("${email.credentials.username}")
    private String EMAIL_SENDER_USERNAME;

    /**
     * The sender's password for sending the email
     */
    @Value("${email.credentials.password}")
    private String EMAIL_SENDER_PASSWORD;

    /**
     * The url of the smtp service for sending the email
     */
    @Value("${email.smtp.url}")
    private String EMAIL_SMTP_URL;

    /**
     * The name of the app that sends the email, useful for trusted email
     */
    @Value("${email.smtp.app}")
    private String EMAIL_SMTP_APP;


    @Autowired
    private GithubService githubService;


    @Autowired
    private NotificationMapDao notificationMapDao;


    @Autowired
    private DevCaseDao devCaseDao;

    @Autowired
    private StageDao stageDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private TemplateDao templateDao;

    @Autowired
    private EmailCreatorService emailCreatorService;


    @Override
    public List<DevCase> getAllDevcases() throws DevCaseServiceException {
        try {
            return devCaseDao.findAll();
        } catch (Exception e) {
            throw new DevCaseServiceException("Unable to retrieve all the DevCases", e);
        }
    }

    @Transactional
    @Override
    public void setupDevCase(CreateDevcaseRequest createDevcaseRequest) throws DevCaseServiceException {

        if (createDevcaseRequest == null || createDevcaseRequest.getCandidate() == null || createDevcaseRequest.getCandidate().getGithubUserName() == null) {
            LOGGER.debug("Impossible to setup the DevCase for the candidate, Candidate name is empty");
            throw new DevCaseServiceException("Impossible to setup the DevCase for the candidate, Candidate name is empty");
        }
        String candidate = createDevcaseRequest.getCandidate().getGithubUserName();

        try {

            String repository;
            String team;
            if (ProjectTypes.BACKEND.get().equals(createDevcaseRequest.getType())) {
                repository = PROJECT_BACKEND;
                team = TEAM_BACKEND;
            } else if (ProjectTypes.FRONTEND.get().equals(createDevcaseRequest.getType())) {
                repository = PROJECT_FRONTEND;
                team = TEAM_FRONTEND;
            } else if (ProjectTypes.ANDROID.get().equals(createDevcaseRequest.getType())) {
                repository = PROJECT_ANDROID;
                team = TEAM_ANDROID;
            }else {
                throw new DevCaseServiceException("Error creating the project : Project type incompatible");
            }

            String repositoryForTheCandidate = repository + "-" + createDevcaseRequest.getCandidate().getGithubUserName();

            //Check if the repository already exists
            String existingRepo = repositoryForTheCandidate;
            Integer count = 0;
            while (githubService.repoExists(COMPANY, existingRepo)) {
                //if the repository already exists then add an incremental number and check with the new repo's name
                existingRepo = repositoryForTheCandidate + "-" + count.toString();
                count = count + 1;
            }
            repositoryForTheCandidate = existingRepo;

            //Create an empty repository
            githubService.createRepo(COMPANY, repositoryForTheCandidate);

            //Copy the content of the original repository into the repoitory for the candidate
            githubService.cloneAndPushMirror(COMPANY, repository, repositoryForTheCandidate);

            //Check if the cloneAndPushMirror has worked successfully
            if (githubService.isRepoEmpty(COMPANY, repositoryForTheCandidate)) {
                throw new DevCaseServiceException("Impossible to setup the DevCase for the candidate, the repository is empty");
            }

            //Add all the reviewer in the repository
            List<GitHubMember> teamMembers = githubService.getTeamMembers(githubService.getTeamId(githubService.getTeams(COMPANY), team));
            for (GitHubMember member : teamMembers) {
                githubService.addCollaborator(member.getUserName(), COMPANY, repositoryForTheCandidate, Permissions.PULL);
                User byGithubUserName = userDao.findByGithubUserName(member.getUserName());
                if (byGithubUserName == null || byGithubUserName.getEmail() == null) {
                    throw new DevCaseServiceException("Impossible to retrieve user " + member.getUserName() + " in the DB ");
                }
                if (createDevcaseRequest.getGitHubReviewers() == null){
                    createDevcaseRequest.setGitHubReviewers(new ArrayList<>());
                }
                createDevcaseRequest.getGitHubReviewers().add(byGithubUserName);
            }

            //Add the candidate in the repository
            githubService.addCollaborator(candidate, COMPANY, repositoryForTheCandidate, Permissions.PUSH);

            //Save all the data (candidate, devcase, etc...) into the DB
            System.out.println("----------");
            saveUserAndDevCase(createDevcaseRequest, repositoryForTheCandidate, createDevcaseRequest.getCreator());

            //Send emails to users
            sendEmailsForStage(1L, createDevcaseRequest, team, GITHUB_URL_WEBSITE + "/" + COMPANY + "/" + repositoryForTheCandidate);

        } catch (GitHubServiceException e) {
            LOGGER.error("Impossible to setup the DevCase for the candidate, problem calling GitHub API " + e.getMessage());
            throw new DevCaseServiceException("Impossible to setup the DevCase for the candidate, problem calling GitHub API " + e.getMessage(), e);
        } catch (Exception e) {
            LOGGER.error("Impossible to setup the DevCase for the candidate " + e.getMessage());
            throw new DevCaseServiceException("Impossible to setup the DevCase for the candidate " + e.getMessage(), e);
        }

    }

    private void saveUserAndDevCase(CreateDevcaseRequest createDevcaseRequest, String repositoryForTheCandidate, User creator) throws DevCaseServiceException {

        try {
            DevCase devCase = new DevCase();

            Role candidateRole = roleDao.findByName(Roles.CANDIDATE.get());
            if (candidateRole == null) {
                LOGGER.error("Role CANDIDATE not present in the DB");
                throw new DevCaseServiceException("Creator is not present in the DB");
            }
            //save candidate
            User candidate = createDevcaseRequest.getCandidate();
            if (candidate == null) {
                LOGGER.error("Candidate not present in the request");
                throw new DevCaseServiceException("Candidate not present in the request");
            }

            //create user if it not exists
            User userByEmail = userDao.findByEmail(createDevcaseRequest.getCandidate().getEmail());
            if (userByEmail != null) {
                candidate = userByEmail;
            } else {
                candidate.setRole(candidateRole);
                userDao.save(candidate);
            }

            devCase.setCandidate(candidate);

            if (creator == null) {
                LOGGER.error("Creator should be not null");
                throw new DevCaseServiceException("Creator should be not null");
            }

            User creatorInDb = userDao.findOne(creator.getId());
            if (creatorInDb == null) {
                LOGGER.error("Creator is not present in the DB");
                throw new DevCaseServiceException("Creator is not present in the DB");
            }
            devCase.setCreator(creatorInDb);

            devCase.setDeadline(createDevcaseRequest.getDeadline());
            devCase.setCreation(new Date());
            devCase.setModified(new Date());

            Stage initStage = stageDao.findByName(Stages.INIT.get());
            devCase.setStage(initStage);

            devCase.setGithubUrl(GITHUB_URL_WEBSITE + "/" + COMPANY + "/" + repositoryForTheCandidate);
            devCase.setType(createDevcaseRequest.getType());

            devCaseDao.save(devCase);
        } catch (Exception e) {
            throw new DevCaseServiceException("Impossible to save candidate and devcase in the DB " + e.getMessage(), e);
        }
    }


    @Override
    public void updateDevcase(Long caseId, Long statusId, User user) throws DevCaseServiceException {
        try {
            DevCase devCase = devCaseDao.getOne(caseId);
            if (devCase == null) {
                LOGGER.error("DevCase not present in the DB");
                throw new DevCaseServiceException("DevCase not present in the DB");
            }
            //review complete, so save the reviewer in the db
            //the reviewer is the person who clicked the button "review complete"
            if (statusId == 3) {
                devCase.setReviewer(user);
            }
            //review complete or project archived, so remove the candidate as collaborator from GitHub
            if (statusId == 3 || statusId == 4) {
                try {
                    String tmp = devCase.getGithubUrl().replace(GITHUB_URL_WEBSITE, "");
                    String repo = tmp.replace("/" + COMPANY + "/", "");
                    if (githubService.isCollaborator(devCase.getCandidate().getGithubUserName(), COMPANY, repo)) {
                        githubService.removeCollaborator(devCase.getCandidate().getGithubUserName(), COMPANY, repo);
                        LOGGER.info("Removed the candidate " + devCase.getCandidate().getGithubUserName() + " from the repository " + devCase.getGithubUrl());
                    }
                } catch (GitHubServiceException e) {
                    LOGGER.error("Impossible to remove the candidate " + devCase.getCandidate().getGithubUserName() + " from the repository " + devCase.getGithubUrl());
                    throw new DevCaseServiceException("Impossible to remove the candidate " + devCase.getCandidate().getGithubUserName() + " from the repository " + devCase.getGithubUrl());
                }
            }

            if (devCase != null) {
                Stage stageRecord = stageDao.findOne(statusId);
                devCase.setStage(stageRecord);
                devCase.setModified(new Date());
                devCaseDao.save(devCase);
            }

            String team;
            String type = devCase.getType();
            if (ProjectTypes.FRONTEND.get().equals(type)) {
                team = Teams.FRONTEND_REVIEWERS.get();
            } else if (ProjectTypes.BACKEND.get().equals(type)){
                team = Teams.BACKEND_REVIEWERS.get();
            } else if (ProjectTypes.ANDROID.get().equals(type)) {
                team = Teams.ANDROID_REVIEWERS.get();
            }else {
                throw new DevCaseServiceException("Error updating the project : Incompatible project type");
            }

                CreateDevcaseRequest createDevcaseRequest = new CreateDevcaseRequest();
            createDevcaseRequest.setType(devCase.getType());
            createDevcaseRequest.setCandidate(devCase.getCandidate());
            createDevcaseRequest.setDeadline(devCase.getDeadline());
            createDevcaseRequest.setCreator(devCase.getCreator());
            createDevcaseRequest.setReviewer(devCase.getReviewer());

            Role github_reviewers = new Role();
            github_reviewers.setName(Roles.REVIEWER.get());
            createDevcaseRequest.setGitHubReviewers(getUsersByRoleAndReviewerTeam(github_reviewers, team));

            //send emails because stage has been changed
            sendEmailsForStage(statusId, createDevcaseRequest, team, devCase.getGithubUrl());
            LOGGER.debug("Status updated for DevCase " + caseId);
        } catch (Exception e) {
            throw new DevCaseServiceException("Impossible to update the devcase. " + e.getMessage(), e);
        }
    }

    private void sendEmailsForStage(Long stageId, CreateDevcaseRequest createDevcaseRequest, String team, String repository) throws DevCaseServiceException {

        try {
            //Send email to Roles defined in the NotificationMap table
            Iterable<NotificationMap> notificationMapIterable = notificationMapDao.findByStage_Id(stageId);

            if (notificationMapIterable == null) {
                LOGGER.error("Info about notifications not present in the DB");
                throw new DevCaseServiceException("Info about notifications not present in the DB");
            }
            if (notificationMapIterable != null) {

                for (NotificationMap notificationMap : notificationMapIterable) {
                    if (notificationMap.getTemplate() == null || notificationMap.getTemplate().getName() == null) {
                        LOGGER.error("No Template assigned in the NotificationMap table");
                        throw new DevCaseServiceException("No Template assigned in the NotificationMap table");
                    }
                    if (notificationMap.getRole() == null || notificationMap.getRole().getName() == null) {
                        LOGGER.error("No Role assigned in the NotificationMap table");
                        throw new DevCaseServiceException("No Role assigned in the NotificationMap table");
                    }
                    Template template = notificationMap.getTemplate();
                    Role role = notificationMap.getRole();
                    List<User> users = new ArrayList<>();

                    if (Roles.CANDIDATE.get().equals(role.getName())) {
                        //send email just to the specific candidate of the project
                        if (createDevcaseRequest.getCandidate() != null) {
                            users.add(createDevcaseRequest.getCandidate());
                        }
                    } else if (Roles.CREATOR.get().equals(role.getName())) {
                        //send email just to the specific creator of the project
                        if (createDevcaseRequest.getCreator() != null) {
                            users.add(createDevcaseRequest.getCreator());
                        }
                    } else if (Roles.REVIEWER.get().equals(role.getName())) {
                        //send email just to the specific reviewer of the project
                        if (createDevcaseRequest.getReviewer() != null) {
                            users.add(createDevcaseRequest.getReviewer());
                        }
                    } else {
                        //send email to all the others
                        users = getUsersByRoleAndReviewerTeam(role, team);
                    }
                    sendEmails(users, template, createDevcaseRequest, repository);
                }
            }
        } catch (Exception e) {
            throw new DevCaseServiceException("Impossible to send email " + e.getMessage(), e);
        }
    }


    private void sendEmails(List<User> users, Template template, CreateDevcaseRequest createDevcaseRequest, String repository) throws DevCaseServiceException {
        try {
            if (users != null && users.size() > 0) {
                //Send an email (with a specific template) to every user whit that role
                for (User user : users) {
                    Map<String, Object> emailBodyContent = new HashMap<>();
                    emailBodyContent.put("project_type", createDevcaseRequest.getType());
                    emailBodyContent.put("candidate", createDevcaseRequest.getCandidate());
                    emailBodyContent.put("creator", createDevcaseRequest.getCreator());
                    emailBodyContent.put("repository_url", repository);
                    emailBodyContent.put("deadline", createDevcaseRequest.getDeadline().toString());
                    emailBodyContent.put("reviewer", createDevcaseRequest.getReviewer());
                    emailBodyContent.put("github_reviewers", createDevcaseRequest.getGitHubReviewers());
                    DevCaseEmail devCaseForUser = new DevCaseEmail();
                    devCaseForUser.setTemplate(template);
                    devCaseForUser.setContent(emailBodyContent);

                    if (user.getEmail() == null) {
                        User byName = userDao.findByName(user.getName());
                        if (byName == null) {
                            LOGGER.error("User not present in the DB");
                            throw new DevCaseServiceException("User not present in the DB");
                        }
                        sendEmail(byName.getEmail(), devCaseForUser);
                        LOGGER.debug("Email sent to " + byName.getEmail());
                    } else {
                        sendEmail(user.getEmail(), devCaseForUser);
                        LOGGER.debug("Email sent to " + user.getEmail());
                    }
                }
            }
        } catch (Exception e) {
            throw new DevCaseServiceException("Impossible to send email " + e.getMessage(), e);
        }
    }


    private void sendEmail(String receiverEmail, DevCaseEmail devCaseEmail) throws DevCaseServiceException {
        try {
            String emailBody = emailCreatorService.generateEmailBody(devCaseEmail);
            String emailSubject = emailCreatorService.generateEmailSubject(devCaseEmail);
            if (emailBody == null) {
                LOGGER.error("Error generating email");
                throw new DevCaseServiceException("Error generating email");
            }
            EmailUtil.send(EMAIL_SENDER_USERNAME, EMAIL_SENDER_PASSWORD, receiverEmail, emailSubject, emailBody, EMAIL_SMTP_URL, EMAIL_SMTP_APP);
            System.out.println("email sent to " + receiverEmail);
        } catch (EmailUtilException e) {
            throw new DevCaseServiceException("Error sending the email", e);
        } catch (EmailCreatorServiceException e) {
            e.printStackTrace();
        }
    }

    private List<User> getUsersByRoleAndReviewerTeam(Role role, String team) throws DevCaseServiceException {

        if (role == null || role.getName() == null) {
            throw new DevCaseServiceException("The role name should be not empty");
        }
        if (Roles.REVIEWERS.get().equals(role.getName())) {
            List<User> reviewers = new ArrayList<>();
            //retrieve users from GitHub API
            try {
                List<GitHubMember> teamMembers = githubService.getTeamMembers(githubService.getTeamId(githubService.getTeams(COMPANY), team));
                if (teamMembers == null) {
                    LOGGER.error("Team members not found");
                    throw new DevCaseServiceException("Team members not found");
                }
                for (GitHubMember member : teamMembers) {
                    User reviewer = userDao.findByGithubUserName(member.getUserName());
                    if (reviewer == null) {
                        LOGGER.error("Team member not found");
                        throw new DevCaseServiceException("Team member not found");
                    }
                    if (reviewer != null) {
                        reviewers.add(reviewer);
                    }
                }
                return reviewers;
            } catch (GitHubServiceException e) {
                LOGGER.error("Impossible to retrieve the list of Reviewer from GitHub");
                throw new DevCaseServiceException("Impossible to retrieve the list of Reviewer from GitHub");
            }
        }
        if (Roles.CANDIDATE.get().equals(role.getName()) || Roles.REVIEWER.get().equals(role.getName())) {
            return new ArrayList<>();
        }
        if (Roles.ADMIN.get().equals(role.getName())
                || Roles.RECRUITER.get().equals(role.getName())) {
            //retrieve ADMIN users and RECRUITER users from the database
            return userDao.findByRole_Name(role.getName());
        }
        return null;
    }

}
