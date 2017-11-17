docker stop case-apocalypse-frontend
docker rm case-apocalypse-frontend
docker run --restart=always -p 80:8080 -d --name case-apocalypse-frontend sytac/case-apocalypse-frontend
