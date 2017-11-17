FROM tomcat

RUN rm -rf /usr/local/tomcat/webapps/ROOT/*.*

ADD dist/*.* /usr/local/tomcat/webapps/ROOT/

EXPOSE 80 8080

CMD ["catalina.sh", "run"]
