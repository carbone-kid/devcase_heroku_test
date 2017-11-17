package com.sytac.caseapocalypse.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.oauth2.Oauth2;
import com.google.api.services.oauth2.model.Userinfoplus;
import com.sytac.caseapocalypse.dao.UserDao;
import com.sytac.caseapocalypse.model.db.User;
import com.sytac.caseapocalypse.model.http.UserLoginRequest;
import com.sytac.caseapocalypse.model.http.UserLoginResponse;
import com.sytac.caseapocalypse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.AccessDeniedException;

@Component
public class UserServiceImpl implements UserService {

    @Autowired
    UserDao userDao;

    public UserLoginResponse login(UserLoginRequest userLoginRequest, ServletRequest servletRequest) throws AccessDeniedException {
        GoogleCredential credential = new GoogleCredential().setAccessToken(userLoginRequest.getToken());
        Oauth2 oauth2 = new Oauth2.Builder(new NetHttpTransport(), new JacksonFactory(), credential)
                .setApplicationName("Oauth2").build();

        Userinfoplus userinfoplus = null;

        try {
            userinfoplus = oauth2.userinfo().get().execute();
        } catch (IOException e) {
            throw new AccessDeniedException("Invalid access key.");
        }

        User user = userDao.findByEmail(userinfoplus.getEmail());

        if (user == null) {
            throw new AccessDeniedException("Invalid access key.");
        }

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpSession httpSession = request.getSession();
        httpSession.setAttribute("user", user);

        UserLoginResponse userLoginResponse = new UserLoginResponse();
        userLoginResponse.setRole(user.getRole().getName());
        userLoginResponse.setEmail(user.getEmail());
        userLoginResponse.setName(user.getName());

        return userLoginResponse;
    }
}
