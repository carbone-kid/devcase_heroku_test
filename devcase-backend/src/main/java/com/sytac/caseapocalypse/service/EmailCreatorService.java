package com.sytac.caseapocalypse.service;

import com.sytac.caseapocalypse.service.exception.EmailCreatorServiceException;
import com.sytac.caseapocalypse.utils.DevCaseEmail;

public interface EmailCreatorService {

    String generateEmailBody(DevCaseEmail devcaseTemplate) throws EmailCreatorServiceException;
    String generateEmailSubject(DevCaseEmail devcaseTemplate) throws EmailCreatorServiceException;
}
