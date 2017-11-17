package com.sytac.caseapocalypse.service;

import com.sytac.caseapocalypse.model.Permissions;
import com.sytac.caseapocalypse.model.db.GitHubMember;
import com.sytac.caseapocalypse.model.Team;
import com.sytac.caseapocalypse.service.exception.GitHubServiceException;

import java.util.List;

public interface GithubService {

    boolean repoExists(String ownerName, String repositoryName) throws GitHubServiceException;

    boolean isRepoEmpty(String ownerName, String repositoryName) throws GitHubServiceException;

    List<GitHubMember> getTeamMembers(String teamId) throws GitHubServiceException;

    List<Team> getTeams(String organizationName) throws GitHubServiceException;

    String getTeamId(List<Team> teams, String teamName);

    void addCollaborator(String username, String owner, String repository, Permissions permissions) throws GitHubServiceException;

    void removeCollaborator(String username, String owner, String repository) throws GitHubServiceException;

    boolean isCollaborator(String username, String owner, String repository) throws GitHubServiceException;

    void createRepo(String organization, String repository) throws GitHubServiceException;

    void cloneAndPushMirror(String owner, String repositoryToClone, String repositoryToCreate) throws GitHubServiceException;
}
