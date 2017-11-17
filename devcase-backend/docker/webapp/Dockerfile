FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
ADD build/libs/devcase-backend-*.jar app.jar
RUN sh -c 'touch /app.jar'
ENV JAVA_OPTS=""
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -jar /app.jar" ]