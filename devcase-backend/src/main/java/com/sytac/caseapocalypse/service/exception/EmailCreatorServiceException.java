package com.sytac.caseapocalypse.service.exception;

public class EmailCreatorServiceException extends Exception {

    public EmailCreatorServiceException(String message) {
        super(message);
    }

    public EmailCreatorServiceException(String message, Exception e) {
        super(message, e);
    }
}
