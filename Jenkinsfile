pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub_id')
        SECRET_KEY = credentials('secret-key-id')
        GOOGLE_API_KEY = credentials('google-api-key')
        DB_PASSWORD = credentials('mysql-password')
         SONAR_TOKEN = credentials('sonar-token')
       // NEXUS_URL = "http://your-nexus-url:8081"
    }

   
    stages {

        stage('Checkout') {
            steps {

                git branch: 'main',
                url: 'https://github.com/Arij-Abid/Full-Stack_Django-React.git'
                sh 'ls -la'

            }
        }

/*
  stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            sh """
                sonar-scanner \
                -Dsonar.projectKey=fullstack-django-react \
                -Dsonar.sources=. \
                -Dsonar.host.url=http://localhost:9000 \
                -Dsonar.login=$SONAR_TOKEN
            """
        }
    }
}
        */

        /* =========================
           3. BACKEND (DJANGO)
        ========================== */
stage('Backend Tests') {
    agent {
        docker {
            image 'python:3.11'
        }
    }
    steps {
        dir('django-ecommerce') {
            sh '''
                python -m venv venv
                . venv/bin/activate
                python -m pip install --upgrade pip
                pip install -r requirements.txt
                python manage.py test
            '''
        }
    }
}

        /* =========================
           4. FRONTEND (REACT)
        ========================== */
  stage('Frontend Build') {
    agent {
        docker {
            image 'node:20'
        }
    }

    steps {
        dir('react-ecommerce-site') {
            sh '''
               export npm_config_cache=/tmp/.npm
                rm -rf node_modules package-lock.json
                npm install
                npm run build
            '''
        }
    }
}
         stage('Create .env') {
    steps {
        sh '''
  cat > django-ecommerce/.env << EOF
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=db
DB_PORT=3306
        EOF
        '''
    }
}
stage('SonarQube Analysis') {
    steps {
        sh '''
        docker run --rm \
          -v $PWD:/usr/src \
          sonarsource/sonar-scanner-cli \
          -Dsonar.projectKey=fullstack-django-react \
          -Dsonar.sources=/usr/src \
          -Dsonar.host.url=http://sonarqube:9000 \
          -Dsonar.login=$SONAR_TOKEN
        '''
    }
}
        /* =========================
           5. BUILD DOCKER IMAGES
        ========================== */
        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                        docker build -t arijabid/django-ecommerce:${BUILD_ID} ./django-ecommerce
                        docker build -t arijabid/react-ecommerce-site:${BUILD_ID} ./react-ecommerce-site
                    """
                }
            }
        }

        /* =========================
           6. DOCKER HUB PUSH
        ========================== */
        stage('Push Docker Hub') {
            steps {
                sh """
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin

                    docker push arijabid/django-ecommerce:${BUILD_ID}
                    docker push arijabid/react-ecommerce-site:${BUILD_ID}
                """
            }
        }


      /*  stage('Push to Nexus') {
            steps {
                echo "Upload artifacts to Nexus (optionnel)"
                // Exemple si tu utilises mvn ou zip artifact
                // sh "curl -u user:pass --upload-file backend.zip ${NEXUS_URL}/repository/maven-releases/"
            }
        }
*/
        /* =========================
           8. DEPLOY WITH DOCKER COMPOSE
        ========================== */
        stage('Deploy') {
            steps {
                sh """
                    docker compose down
                    docker compose up -d --build
                """
            }
        }
    }

    /* =========================
       POST ACTIONS
    ========================== */
    post {
        always {
            sh 'docker logout || true'
            echo 'Pipeline terminé'
        }

        success {
            echo '✅ Build réussi'
        }

        failure {
            echo '❌ Pipeline échoué'
        }
    }
}
