package com.sytac.caseapocalypse.utils;

import com.google.api.client.repackaged.org.apache.commons.codec.binary.Base64;
import com.sun.mail.smtp.SMTPTransport;
import com.sytac.caseapocalypse.service.impl.DevCaseServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

public class EmailUtil {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailUtil.class);


    public static void send(String from, String password, String to, String subject, String body, String smtpServer, String app) throws EmailUtilException {
        try {
            Properties props = System.getProperties();
            props.put("mail.smtps.host", smtpServer);
            props.put("mail.smtps.auth", "true");

            Session session = Session.getInstance(props, null);

            Message msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress(from));
            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to, false));
            msg.setSubject(subject);
            msg.setText(body);
            msg.setHeader("X-Mailer", app);
            msg.setSentDate(new Date());

            SMTPTransport t = (SMTPTransport) session.getTransport("smtps");
            t.connect(smtpServer, from, password);
            t.sendMessage(msg, msg.getAllRecipients());
            LOGGER.debug("Email sent, response: " + t.getLastServerResponse());
            t.close();
        } catch (MessagingException e) {
            LOGGER.error("Impossible to send the email");
            throw new EmailUtilException("Impossible to send the email " + e);
        }

    }





}