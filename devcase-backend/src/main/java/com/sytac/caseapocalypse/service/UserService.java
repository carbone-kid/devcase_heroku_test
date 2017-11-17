package com.sytac.caseapocalypse.service;

import com.sytac.caseapocalypse.model.http.UserLoginRequest;
import com.sytac.caseapocalypse.model.http.UserLoginResponse;

import javax.servlet.ServletRequest;
import java.nio.file.AccessDeniedException;

public interface UserService {
    UserLoginResponse login(UserLoginRequest userLoginRequest, ServletRequest servletRequest) throws AccessDeniedException;
}
