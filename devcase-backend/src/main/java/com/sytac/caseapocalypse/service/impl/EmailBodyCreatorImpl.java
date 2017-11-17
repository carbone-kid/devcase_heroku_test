package com.sytac.caseapocalypse.service.impl;

import com.sytac.caseapocalypse.service.EmailCreatorService;
import com.sytac.caseapocalypse.service.exception.EmailCreatorServiceException;
import com.sytac.caseapocalypse.utils.DevCaseEmail;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;

@Component
public class EmailBodyCreatorImpl implements EmailCreatorService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailBodyCreatorImpl.class);


    public String generateEmailSubject(DevCaseEmail devcaseTemplate) throws EmailCreatorServiceException {
        return generateContent(devcaseTemplate,devcaseTemplate.getTemplate().getSubject());
    }

    public String generateEmailBody(DevCaseEmail devcaseTemplate) throws EmailCreatorServiceException {
        return generateContent(devcaseTemplate,devcaseTemplate.getTemplate().getContent());
    }

    public String generateContent(DevCaseEmail devcaseTemplate, String variableText) throws EmailCreatorServiceException {

        try {
            //Instantiate Configuration class
            Configuration cfg = new Configuration();
            cfg.setDefaultEncoding("UTF-8");
            cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);

            //Instantiate template
//            String templateStr="Hello ${user}";
            Template template = new Template("email", new StringReader(variableText), cfg);

            //Console output
            Writer outputStreamWriter = new StringWriter();
            template.process(devcaseTemplate.getContent(), outputStreamWriter);
            outputStreamWriter.flush();
            // get the String from the StringWriter
            String html = outputStreamWriter.toString();
            LOGGER.debug("Html generated with freemarker");
            return html;
        } catch (IOException | TemplateException e) {
            LOGGER.error("Error executing freemarker");
            throw new EmailCreatorServiceException("Error executing freemarker" , e);
        }
    }



}