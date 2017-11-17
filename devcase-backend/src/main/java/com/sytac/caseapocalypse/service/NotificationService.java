package com.sytac.caseapocalypse.service;

import com.sytac.caseapocalypse.model.db.NotificationMap;
import com.sytac.caseapocalypse.model.db.Role;

import com.sytac.caseapocalypse.model.http.NotificationMapRequest;
import com.sytac.caseapocalypse.service.exception.DevCaseServiceException;

import java.util.List;

public interface NotificationService {
    List<Role> getAllRoles() throws DevCaseServiceException;
    List<Role> getRolesForStage(String stage) throws DevCaseServiceException;
    List<NotificationMap> getRolesTemplatesByStage(Long stageId) throws DevCaseServiceException;
    void addRoleToStage(NotificationMapRequest notificationMapRequest) throws DevCaseServiceException;
    void deleteRoleFromStage(NotificationMapRequest notificationMapRequest) throws DevCaseServiceException;
    List<NotificationMap> findAll();
    void deleteByStageRoleTemplate(Long stageId, Long roleId, Long templateId) throws DevCaseServiceException;
}
