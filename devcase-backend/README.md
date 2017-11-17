# SYTAC-DEVCASE - Back-end

### To be able to build backend these stack needs to be installed
```
1. JDK 8
2. Maven
```

### To be able to run backend locally
```
These stack needs to be installed
  1. JDK 8
  2. Maven
  3. Postgresql
 
The database "caseapocalypse" should be created
 
Pay attention to the database server port number when composing datasourse URL as it can be different.
The port number can be found in pgAdmin database client.
```

### To run it on a host go to the backend root directory and execute
```
mvn package
```

### Then go to `target` directory and execute
```
java -jar -Dspring.datasource.url=jdbc:postgresql://[database url]:[port]/[database name] -Dspring.datasource.username=[database user] -Dspring.datasource.password=[database password] -Dgithub.credentials.username=[githug user] -Dgithub.credentials.password=[github password] [application name].jar
```

### Example
```
java -jar -Dspring.datasource.url=jdbc:postgresql://127.0.0.1:5433/caseapocalypse -Dspring.datasource.username=postgres -Dspring.datasource.password=123 case-apocalypse-backend-0.0.1-SNAPSHOT.jar
```

### To run it in a docker container 

Open the config file pg_hba.conf inside your PostgreSQL installation directory
and add this string to the end of the file:
``` 
host    all             all             [ip address]/32        md5
```
Where [ip address] is the IP address of your computer where you are running PostgreSQL server.

After that build the Docker image and run the container passing URL to the database as a parameter.
```
docker stop case-apocalypse-backend
docker rm case-apocalypse-backend
mvn package
mvn docker:build
docker run --restart=always -e "JAVA_OPTS=-Dspring.datasource.url=jdbc:postgresql://[database url]:[port]/[database name] -Dspring.datasource.username=[database user] -Dspring.datasource.password=[database password] -Dgithub.credentials.username=[githug user] -Dgithub.credentials.password=[github password]" -p 8080:8080 -d --name case-apocalypse-backend sytac/case-apocalypse-backend
```

In order to run the application in production securely over HTTPS the additional options has 
to be in the parameters to the Docker container.
```
docker run --restart=always -e "JAVA_OPTS=-Dspring.datasource.url=jdbc:postgresql://[database url]:[port]/[database name] -Dspring.datasource.username=[database user] -Dspring.datasource.password=[database password] -Dgithub.credentials.username=[githug user] -Dgithub.credentials.password=[github password] -Dserver.port=433 -Dserver.ssl.key-store=[the path to .p12 keystore] server.ssl.key-store-password=[] server.ssl.key-password=[]" -p 433:433 -d --name case-apocalypse-backend sytac/case-apocalypse-backend
```
Most probably you will get .key and .pem files from the certificate authority. The .p12 file can be composed from those files 
using "openssl" command line tool and probably "keytool" command line tool as well.

### To test if the backend is running type this url in the web browser
```
[ip address:port]/api/test-connection
```
