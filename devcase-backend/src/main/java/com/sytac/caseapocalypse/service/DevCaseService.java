package com.sytac.caseapocalypse.service;

import com.sytac.caseapocalypse.model.db.DevCase;
import com.sytac.caseapocalypse.model.db.User;
import com.sytac.caseapocalypse.model.http.CreateDevcaseRequest;
import com.sytac.caseapocalypse.service.exception.DevCaseServiceException;

import java.util.List;

public interface DevCaseService {
    List<DevCase> getAllDevcases() throws DevCaseServiceException;
    void setupDevCase(CreateDevcaseRequest info) throws DevCaseServiceException;
    void updateDevcase(Long caseId, Long statusId, User user) throws DevCaseServiceException;
}
